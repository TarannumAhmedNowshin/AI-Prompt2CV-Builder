"""
Document Parser Service
Extracts CV information from uploaded documents (PDF, DOCX, TXT)
Focused on reliable extraction: name, email, phone, location, skills
"""

import re
import io
from typing import Dict, List, Any
from dataclasses import dataclass, field


@dataclass
class ParsedCVData:
    full_name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    website: str = ""
    summary: str = ""
    experience: List[Dict] = field(default_factory=list)
    education: List[Dict] = field(default_factory=list)
    skills: List[Dict] = field(default_factory=list)
    projects: List[Dict] = field(default_factory=list)
    confidence_scores: Dict[str, float] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "full_name": self.full_name,
            "email": self.email,
            "phone": self.phone,
            "location": self.location,
            "linkedin": self.linkedin,
            "website": self.website,
            "summary": self.summary,
            "experience": self.experience,
            "education": self.education,
            "skills": self.skills,
            "projects": self.projects,
            "confidence_scores": self.confidence_scores,
        }


class DocumentParser:
    """Parser for extracting CV information from documents - focused on reliable fields"""

    # Email pattern - very reliable
    EMAIL_PATTERN = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    
    # Phone patterns - multiple formats
    PHONE_PATTERNS = [
        r'\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',  # US format
        r'\+?\d{1,3}[-.\s]?\d{4,5}[-.\s]?\d{4,6}',  # International
        r'\(\d{3}\)\s*\d{3}[-.\s]?\d{4}',  # (123) 456-7890
    ]
    
    # LinkedIn pattern
    LINKEDIN_PATTERN = r'(?:linkedin\.com/in/|linkedin:\s*)([A-Za-z0-9_-]+)'
    
    # Common skills - comprehensive list
    KNOWN_SKILLS = [
        # Programming Languages
        'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'c', 'ruby', 'go', 
        'golang', 'rust', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl',
        'objective-c', 'dart', 'lua', 'haskell', 'elixir', 'clojure', 'f#',
        
        # Web Frontend
        'html', 'html5', 'css', 'css3', 'sass', 'scss', 'less', 'tailwind', 'tailwindcss',
        'bootstrap', 'react', 'reactjs', 'react.js', 'angular', 'angularjs', 'vue', 
        'vuejs', 'vue.js', 'svelte', 'next.js', 'nextjs', 'nuxt', 'nuxtjs', 'gatsby',
        'jquery', 'redux', 'mobx', 'webpack', 'vite', 'babel',
        
        # Web Backend
        'node.js', 'nodejs', 'node', 'express', 'expressjs', 'fastapi', 'django', 
        'flask', 'spring', 'spring boot', 'springboot', 'asp.net', '.net', 'dotnet',
        'rails', 'ruby on rails', 'laravel', 'symfony', 'gin', 'fiber', 'fastify',
        'nestjs', 'koa',
        
        # Databases
        'sql', 'mysql', 'postgresql', 'postgres', 'mongodb', 'redis', 'elasticsearch',
        'oracle', 'sqlite', 'dynamodb', 'cassandra', 'mariadb', 'firebase', 'supabase',
        'neo4j', 'couchdb', 'influxdb', 'timescaledb',
        
        # Cloud & DevOps
        'aws', 'amazon web services', 'azure', 'gcp', 'google cloud', 'docker', 
        'kubernetes', 'k8s', 'terraform', 'ansible', 'jenkins', 'gitlab ci', 
        'github actions', 'circleci', 'travis ci', 'ci/cd', 'devops', 'nginx',
        'apache', 'linux', 'unix', 'bash', 'shell', 'powershell',
        
        # Data Science & ML
        'pandas', 'numpy', 'scikit-learn', 'sklearn', 'tensorflow', 'pytorch', 
        'keras', 'machine learning', 'deep learning', 'nlp', 'natural language processing',
        'computer vision', 'opencv', 'data analysis', 'data science', 'jupyter',
        'matplotlib', 'seaborn', 'plotly', 'tableau', 'power bi', 'excel',
        'spacy', 'nltk', 'hugging face', 'transformers', 'llm', 'ai',
        
        # Tools & Version Control
        'git', 'github', 'gitlab', 'bitbucket', 'svn', 'jira', 'confluence', 
        'slack', 'trello', 'asana', 'notion', 'figma', 'sketch', 'adobe xd',
        'postman', 'insomnia', 'swagger', 'vscode', 'visual studio', 'intellij',
        
        # Mobile
        'react native', 'flutter', 'ios', 'android', 'xamarin', 'ionic',
        'swiftui', 'jetpack compose',
        
        # Testing
        'jest', 'mocha', 'chai', 'cypress', 'selenium', 'puppeteer', 'playwright',
        'pytest', 'unittest', 'junit', 'testing', 'tdd', 'bdd',
        
        # Other Tech
        'graphql', 'rest', 'restful', 'api', 'microservices', 'websocket',
        'oauth', 'jwt', 'authentication', 'security', 'agile', 'scrum',
        'kanban', 'oop', 'functional programming', 'design patterns',
    ]

    def __init__(self):
        self.text = ""
        self.lines = []

    def parse_document(self, file_content: bytes, filename: str) -> ParsedCVData:
        """Main entry point for parsing a document"""
        file_ext = filename.lower().split('.')[-1]

        if file_ext == 'pdf':
            self.text = self._extract_from_pdf(file_content)
        elif file_ext in ['docx', 'doc']:
            self.text = self._extract_from_docx(file_content)
        elif file_ext == 'txt':
            self.text = file_content.decode('utf-8', errors='ignore')
        else:
            raise ValueError(f"Unsupported file type: {file_ext}")

        # Clean up text
        self.text = self._clean_text(self.text)
        self.lines = [line.strip() for line in self.text.split('\n') if line.strip()]

        # Parse only reliable fields
        parsed_data = ParsedCVData()
        
        parsed_data.email = self._extract_email()
        parsed_data.phone = self._extract_phone()
        parsed_data.full_name = self._extract_name()
        parsed_data.location = self._extract_location()
        parsed_data.linkedin = self._extract_linkedin()
        parsed_data.skills = self._extract_skills()

        # Calculate confidence scores
        parsed_data.confidence_scores = self._calculate_confidence(parsed_data)

        return parsed_data

    def _clean_text(self, text: str) -> str:
        """Clean up extracted text"""
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        # Restore newlines for structure
        text = re.sub(r' ?\n ?', '\n', text)
        # Remove special characters that aren't useful
        text = re.sub(r'[^\w\s@.+\-(),/:\'\"#&]', ' ', text)
        return text.strip()

    def _extract_from_pdf(self, content: bytes) -> str:
        """Extract text from PDF"""
        try:
            import PyPDF2
            reader = PyPDF2.PdfReader(io.BytesIO(content))
            text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return text
        except ImportError:
            try:
                import pdfplumber
                with pdfplumber.open(io.BytesIO(content)) as pdf:
                    text = ""
                    for page in pdf.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text += page_text + "\n"
                    return text
            except ImportError:
                raise ImportError("Please install PyPDF2 or pdfplumber: pip install PyPDF2 pdfplumber")

    def _extract_from_docx(self, content: bytes) -> str:
        """Extract text from DOCX"""
        try:
            from docx import Document
            doc = Document(io.BytesIO(content))
            text = ""
            for para in doc.paragraphs:
                text += para.text + "\n"
            return text
        except ImportError:
            raise ImportError("Please install python-docx: pip install python-docx")

    def _extract_email(self) -> str:
        """Extract email address - most reliable field"""
        matches = re.findall(self.EMAIL_PATTERN, self.text, re.IGNORECASE)
        if matches:
            # Return the first valid-looking email
            for email in matches:
                # Skip common non-personal emails
                if not any(skip in email.lower() for skip in ['noreply', 'support', 'info@', 'example']):
                    return email.lower()
            return matches[0].lower()
        return ""

    def _extract_phone(self) -> str:
        """Extract phone number"""
        for pattern in self.PHONE_PATTERNS:
            matches = re.findall(pattern, self.text)
            for match in matches:
                # Clean the phone number
                digits = re.sub(r'\D', '', match)
                if 10 <= len(digits) <= 15:  # Valid phone length
                    return match.strip()
        return ""

    def _extract_name(self) -> str:
        """Extract full name - look at the beginning of document"""
        # Get email domain to help identify name
        email = self._extract_email()
        email_parts = []
        if email:
            local_part = email.split('@')[0]
            # Split by common separators in email
            email_parts = re.split(r'[._\-\d]+', local_part.lower())
            email_parts = [p for p in email_parts if len(p) > 1]

        # Look at first 10 lines for a name
        for line in self.lines[:10]:
            # Skip lines that are clearly not names
            if self._is_contact_info(line):
                continue
            if len(line) < 3 or len(line) > 50:
                continue
            
            words = line.split()
            
            # A name is typically 2-4 words
            if 2 <= len(words) <= 4:
                # Check if all words look like name parts (capitalized, alphabetic)
                is_name_like = all(
                    word[0].isupper() and 
                    word.replace('-', '').replace("'", '').isalpha() and
                    len(word) >= 2
                    for word in words
                )
                
                if is_name_like:
                    # Extra validation: check if matches email pattern
                    if email_parts:
                        line_lower = line.lower()
                        if any(part in line_lower for part in email_parts):
                            return line
                    return line
        
        # Fallback: try to construct from email
        if email_parts and len(email_parts) >= 2:
            return ' '.join(part.capitalize() for part in email_parts[:2])
        
        return ""

    def _extract_location(self) -> str:
        """Extract location - city, state/country"""
        # Common US state abbreviations
        states = r'AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC'
        
        # Pattern: City, ST or City, ST 12345
        pattern1 = rf'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*({states})(?:\s+\d{{5}})?'
        match = re.search(pattern1, self.text)
        if match:
            city = match.group(1)
            state = match.group(2)
            return f"{city}, {state}"
        
        # Pattern: City, Country (for international)
        pattern2 = r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)'
        for line in self.lines[:15]:  # Location usually near top
            if self._is_contact_info(line) and '@' not in line:
                match = re.search(pattern2, line)
                if match:
                    location = match.group(0)
                    # Validate it's not part of a longer phrase
                    if len(location) < 40:
                        return location
        
        return ""

    def _extract_linkedin(self) -> str:
        """Extract LinkedIn profile"""
        # Full URL
        url_match = re.search(r'linkedin\.com/in/([A-Za-z0-9_-]+)', self.text, re.IGNORECASE)
        if url_match:
            return f"linkedin.com/in/{url_match.group(1)}"
        return ""

    def _extract_skills(self) -> List[Dict]:
        """Extract skills by matching against known skill list"""
        found_skills = []
        text_lower = self.text.lower()
        
        # Track already added skills to avoid duplicates
        added_skills = set()
        
        for skill in self.KNOWN_SKILLS:
            skill_lower = skill.lower()
            
            # Skip if already added (handles variations like "react" and "reactjs")
            if skill_lower in added_skills:
                continue
            
            # Check for word boundary match
            pattern = rf'\b{re.escape(skill_lower)}\b'
            if re.search(pattern, text_lower):
                # Normalize skill name for display
                display_name = skill.title() if len(skill) > 2 else skill.upper()
                
                # Handle special cases
                if skill_lower in ['aws', 'gcp', 'css', 'html', 'sql', 'api', 'jwt', 'ci/cd', 'ai', 'ml', 'nlp']:
                    display_name = skill.upper()
                elif '.' in skill or skill_lower.startswith('react') or skill_lower.startswith('node'):
                    display_name = skill  # Keep original casing
                
                found_skills.append({
                    "name": display_name,
                    "category": self._categorize_skill(skill_lower)
                })
                added_skills.add(skill_lower)
                
                # Also add common variations to avoid duplicates
                if skill_lower == 'react':
                    added_skills.update(['reactjs', 'react.js'])
                elif skill_lower == 'node':
                    added_skills.update(['nodejs', 'node.js'])
                elif skill_lower == 'vue':
                    added_skills.update(['vuejs', 'vue.js'])
        
        return found_skills

    def _categorize_skill(self, skill: str) -> str:
        """Categorize a skill"""
        programming = ['python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'c', 'ruby', 'go', 'rust', 'php', 'swift', 'kotlin', 'scala', 'r', 'dart']
        web = ['html', 'css', 'react', 'angular', 'vue', 'next', 'node', 'express', 'django', 'flask', 'tailwind', 'bootstrap']
        database = ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'firebase', 'dynamodb']
        cloud = ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'ci/cd']
        data = ['pandas', 'numpy', 'tensorflow', 'pytorch', 'machine learning', 'data science', 'jupyter']
        
        skill = skill.lower()
        if any(s in skill for s in programming):
            return "Programming"
        elif any(s in skill for s in web):
            return "Web"
        elif any(s in skill for s in database):
            return "Database"
        elif any(s in skill for s in cloud):
            return "Cloud & DevOps"
        elif any(s in skill for s in data):
            return "Data Science"
        return "Other"

    def _is_contact_info(self, line: str) -> bool:
        """Check if line contains contact info"""
        line_lower = line.lower()
        return bool(
            re.search(self.EMAIL_PATTERN, line) or
            any(re.search(p, line) for p in self.PHONE_PATTERNS) or
            'linkedin' in line_lower or
            'github' in line_lower or
            re.search(r'\d{5}', line) or  # ZIP code
            '@' in line
        )

    def _calculate_confidence(self, data: ParsedCVData) -> Dict[str, float]:
        """Calculate confidence scores"""
        scores = {}
        
        # Email - very reliable if found
        scores['email'] = 0.95 if data.email else 0.0
        
        # Phone - reliable if found
        if data.phone:
            digits = len(re.sub(r'\D', '', data.phone))
            scores['phone'] = 0.9 if 10 <= digits <= 15 else 0.5
        else:
            scores['phone'] = 0.0
        
        # Name - moderate confidence
        if data.full_name:
            words = data.full_name.split()
            scores['full_name'] = 0.8 if 2 <= len(words) <= 4 else 0.5
        else:
            scores['full_name'] = 0.0
        
        # Location
        scores['location'] = 0.7 if data.location else 0.0
        
        # Skills - confidence based on count
        scores['skills'] = min(0.9, 0.15 * len(data.skills)) if data.skills else 0.0
        
        # Overall
        scores['overall'] = sum(scores.values()) / len(scores)
        
        return scores


# Singleton instance
document_parser = DocumentParser()

