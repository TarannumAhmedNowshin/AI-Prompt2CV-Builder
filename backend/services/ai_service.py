import os
import json
from typing import Dict, Any
from openai import AzureOpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class AIService:
    """Service for AI-powered CV content generation"""
    
    _instance = None
    _client = None
    _deployment = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AIService, cls).__new__(cls)
        return cls._instance
    
    def _initialize_client(self):
        """Lazy initialization of Azure OpenAI client"""
        if self._client is not None:
            return
            
        # Initialize Azure OpenAI client with new variable names
        api_key = os.getenv("AZURE_OPENAI_API_KEY")
        endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
        api_version = os.getenv("AZURE_OPENAI_API_VERSION")
        deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT")
        
        # Fallback to old variable names if new ones don't exist
        if not api_key:
            api_key = os.getenv("4-o_API_KEY")
        if not endpoint:
            endpoint = os.getenv("4-o_ENDPOINT")
        if not api_version:
            api_version = os.getenv("4-o_API_VERSION")
        if not deployment:
            deployment = os.getenv("4-o_DEPLOYMENT")
        
        # Debug logging
        print(f"API Key exists: {bool(api_key)}")
        print(f"Endpoint: {endpoint if endpoint else 'None'}")
        print(f"API Version: {api_version if api_version else 'None'}")
        print(f"Deployment: {deployment if deployment else 'None'}")
        
        if not all([api_key, endpoint, api_version, deployment]):
            missing = []
            if not api_key: missing.append("API_KEY")
            if not endpoint: missing.append("ENDPOINT")
            if not api_version: missing.append("API_VERSION")
            if not deployment: missing.append("DEPLOYMENT")
            raise ValueError(f"Azure OpenAI environment variables are missing: {', '.join(missing)}. Check .env file.")
        
        # Clean up values
        api_key = api_key.strip().strip('"')
        endpoint = endpoint.strip().strip('"')
        
        # Extract base endpoint URL if full URL is provided
        if '/openai/deployments' in endpoint:
            endpoint = endpoint.split('/openai/deployments')[0]
        
        # Ensure endpoint ends with /
        if not endpoint.endswith('/'):
            endpoint += '/'
        
        print(f"Initializing Azure OpenAI with endpoint: {endpoint}")
        
        try:
            self._client = AzureOpenAI(
                api_key=api_key,
                api_version=api_version,
                azure_endpoint=endpoint
            )
            self._deployment = deployment
            print("Azure OpenAI client initialized successfully")
        except Exception as e:
            print(f"Error initializing Azure OpenAI client: {e}")
            raise
    
    async def generate_cv_content(self, prompt: str) -> Dict[str, Any]:
        """
        Generate CV content from user prompt using GPT
        
        Args:
            prompt: User's description of their experience, skills, etc.
            
        Returns:
            Dictionary with extracted CV information
        """
        
        # Initialize client if not already done
        self._initialize_client()
        
        system_prompt = """You are an expert CV/Resume writer. Extract and structure CV information from the user's description.

Return a JSON object with exactly this structure:
{
  "full_name": "string or empty string",
  "email": "string or empty string",
  "phone": "string or empty string",
  "location": "string or empty string",
  "summary": "A professional 2-3 sentence summary",
  "experience": [
    {
      "job_title": "string",
      "employer": "string",
      "location": "string",
      "start_date": "MM/YYYY or YYYY",
      "end_date": "MM/YYYY or YYYY or Present",
      "description": "bullet-point achievements, each on a new line starting with a dash"
    }
  ],
  "education": [
    {
      "school": "institution name",
      "degree": "e.g. Bachelor of Science",
      "field": "e.g. Computer Science",
      "start_date": "MM/YYYY or YYYY",
      "end_date": "MM/YYYY or YYYY",
      "location": "string",
      "description": "relevant coursework, honors, etc.",
      "gpa": "e.g. 3.8/4.0 or empty string"
    }
  ],
  "skills": [
    {
      "name": "skill name",
      "level": "beginner or intermediate or advanced or expert or empty string"
    }
  ],
  "projects": [
    {
      "name": "project name",
      "description": "what the project does and your role",
      "technologies": "comma-separated technologies used",
      "start_date": "MM/YYYY or YYYY or empty string",
      "end_date": "MM/YYYY or YYYY or empty string",
      "link": "URL or empty string"
    }
  ],
  "research": [
    {
      "title": "publication or research title",
      "publisher": "journal, conference, or publisher name",
      "authors": "comma-separated author names",
      "date": "MM/YYYY or YYYY",
      "description": "brief description of the research",
      "link": "DOI or URL or empty string"
    }
  ]
}

Rules:
- Return arrays even if there is only one item. Return empty arrays [] if a section has no data.
- For fields not mentioned by the user, return empty string "".
- Write professional, concise descriptions. Use action verbs for experience descriptions.
- If the user mentions projects or research/publications, populate those arrays.
- Keep the tone professional throughout."""
        
        try:
            response = self._client.chat.completions.create(
                model=self._deployment,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.4,
                response_format={"type": "json_object"}
            )

            content = response.choices[0].message.content
            cv_data = json.loads(content)

            return {
                "full_name": cv_data.get("full_name", ""),
                "email": cv_data.get("email", ""),
                "phone": cv_data.get("phone", ""),
                "location": cv_data.get("location", ""),
                "summary": cv_data.get("summary", ""),
                "experience": cv_data.get("experience", []),
                "education": cv_data.get("education", []),
                "skills": cv_data.get("skills", []),
                "projects": cv_data.get("projects", []),
                "research": cv_data.get("research", []),
            }

        except Exception as e:
            print(f"Error generating CV content: {e}")
            return {
                "full_name": "",
                "email": "",
                "phone": "",
                "location": "",
                "summary": f"Based on your input: {prompt[:100]}...",
                "experience": [],
                "education": [],
                "skills": [],
                "projects": [],
                "research": [],
            }

    async def generate_job_suggestions(self, cv_data: Dict[str, Any], job_description: str) -> Dict[str, Any]:
        """
        Analyze CV against a job description and provide tailored suggestions
        
        Args:
            cv_data: The user's current CV data
            job_description: The job description to match against
            
        Returns:
            Dictionary with suggestions for improving the CV for this job
        """
        
        # Initialize client if not already done
        self._initialize_client()
        
        # Format CV data for the prompt
        cv_summary = f"""
        Name: {cv_data.get('full_name', 'Not provided')}
        Summary: {cv_data.get('summary', 'Not provided')}
        Experience: {cv_data.get('experience', 'Not provided')}
        Education: {cv_data.get('education', 'Not provided')}
        Skills: {cv_data.get('skills', 'Not provided')}
        """
        
        system_prompt = """You are an expert career coach and CV/Resume consultant. Analyze the provided CV against the job description and provide actionable suggestions to help the candidate tailor their CV for this specific position.

Return a JSON object with these fields:
- match_score: A percentage (0-100) indicating how well the CV matches the job requirements
- summary_suggestions: Specific suggestions to improve the professional summary for this job
- skills_to_highlight: List of skills from the CV that should be emphasized for this job
- skills_to_add: List of skills mentioned in the job description that the candidate should consider adding or developing
- experience_suggestions: Suggestions for how to better present work experience for this role
- keywords_to_include: Important keywords from the job description that should be incorporated into the CV
- overall_recommendations: 3-5 bullet points with overall recommendations to improve chances for this position
- strengths: What aspects of the CV align well with the job
- gaps: Areas where the CV could be stronger for this specific role

Be specific, actionable, and encouraging. Focus on realistic improvements the candidate can make."""

        user_prompt = f"""
## Current CV:
{cv_summary}

## Job Description:
{job_description}

Please analyze this CV against the job description and provide detailed suggestions for improvement.
"""
        
        try:
            response = self._client.chat.completions.create(
                model=self._deployment,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            suggestions = json.loads(content)
            
            return {
                "match_score": suggestions.get("match_score", 0),
                "summary_suggestions": suggestions.get("summary_suggestions", ""),
                "skills_to_highlight": suggestions.get("skills_to_highlight", []),
                "skills_to_add": suggestions.get("skills_to_add", []),
                "experience_suggestions": suggestions.get("experience_suggestions", ""),
                "keywords_to_include": suggestions.get("keywords_to_include", []),
                "overall_recommendations": suggestions.get("overall_recommendations", []),
                "strengths": suggestions.get("strengths", ""),
                "gaps": suggestions.get("gaps", ""),
            }
            
        except Exception as e:
            print(f"Error generating job suggestions: {e}")
            return {
                "match_score": 0,
                "summary_suggestions": "Unable to generate suggestions. Please try again.",
                "skills_to_highlight": [],
                "skills_to_add": [],
                "experience_suggestions": "",
                "keywords_to_include": [],
                "overall_recommendations": ["Please try again with a more detailed job description."],
                "strengths": "",
                "gaps": "",
                "error": str(e)
            }


# Singleton instance
ai_service = AIService()
