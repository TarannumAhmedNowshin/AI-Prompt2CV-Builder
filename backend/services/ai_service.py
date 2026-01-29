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
        
        Return a JSON object with these fields:
        - full_name: Extract if mentioned
        - email: Extract if mentioned
        - phone: Extract if mentioned
        - location: Extract if mentioned
        - summary: Write a professional 2-3 sentence summary
        - experience: List work experiences (each on a new line with format: "Job Title at Company (Year-Year) - Description")
        - education: List education (each on a new line with format: "Degree in Field, Institution (Year)")
        - skills: Comma-separated list of skills
        
        If information is not provided, return empty string for that field.
        Keep the tone professional and concise."""
        
        try:
            response = self._client.chat.completions.create(
                model=self._deployment,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
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
                "experience": cv_data.get("experience", ""),
                "education": cv_data.get("education", ""),
                "skills": cv_data.get("skills", ""),
            }
            
        except Exception as e:
            print(f"Error generating CV content: {e}")
            # Return a fallback response
            return {
                "full_name": "",
                "email": "",
                "phone": "",
                "location": "",
                "summary": f"Based on your input: {prompt[:100]}...",
                "experience": "",
                "education": "",
            }


# Singleton instance
ai_service = AIService()
