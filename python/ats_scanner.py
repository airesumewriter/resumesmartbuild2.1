#!/usr/bin/env python3
"""
ATS Resume Scanner
Analyzes resume content for ATS compatibility and provides optimization suggestions
"""

import json
import sys
import re
from typing import Dict, List, Any
import textstat
from collections import Counter

class ATSScanner:
    def __init__(self):
        # Industry-specific keywords database
        self.industry_keywords = {
            'tech': [
                'python', 'javascript', 'react', 'node.js', 'aws', 'docker', 'kubernetes',
                'agile', 'scrum', 'git', 'sql', 'nosql', 'api', 'microservices',
                'machine learning', 'ai', 'data science', 'devops', 'ci/cd'
            ],
            'healthcare': [
                'cpr', 'emr', 'hipaa', 'patient care', 'medical records', 'nursing',
                'healthcare', 'clinical', 'medical', 'diagnosis', 'treatment'
            ],
            'finance': [
                'gaap', 'roi', 'financial analysis', 'excel', 'bloomberg', 'risk management',
                'investment', 'portfolio', 'accounting', 'audit', 'compliance', 'taxation'
            ],
            'marketing': [
                'seo', 'sem', 'google analytics', 'social media', 'content marketing',
                'email marketing', 'conversion', 'brand management', 'digital marketing'
            ],
            'general': [
                'leadership', 'communication', 'project management', 'teamwork',
                'problem solving', 'analytical', 'detail-oriented', 'customer service'
            ]
        }
        
        # Required resume sections
        self.required_sections = [
            'experience', 'education', 'skills', 'contact', 'summary'
        ]
    
    def extract_text(self, content: Dict[str, Any]) -> str:
        """Extract all text from resume content"""
        text_parts = []
        
        # Extract from different sections
        if 'summary' in content:
            text_parts.append(content['summary'])
        
        if 'experience' in content:
            for exp in content['experience']:
                text_parts.extend([
                    exp.get('title', ''),
                    exp.get('company', ''),
                    exp.get('description', '')
                ])
        
        if 'education' in content:
            for edu in content['education']:
                text_parts.extend([
                    edu.get('degree', ''),
                    edu.get('school', ''),
                    edu.get('description', '')
                ])
        
        if 'skills' in content:
            if isinstance(content['skills'], list):
                text_parts.extend(content['skills'])
            else:
                text_parts.append(str(content['skills']))
        
        return ' '.join(text_parts).lower()
    
    def detect_industry(self, text: str) -> str:
        """Detect industry based on keywords in resume"""
        industry_scores = {}
        
        for industry, keywords in self.industry_keywords.items():
            if industry == 'general':
                continue
            score = sum(1 for keyword in keywords if keyword.lower() in text)
            industry_scores[industry] = score
        
        # Return industry with highest score, or 'general' if no clear match
        if industry_scores and max(industry_scores.values()) > 2:
            return max(industry_scores, key=industry_scores.get)
        return 'general'
    
    def check_keywords(self, text: str, industry: str) -> Dict[str, Any]:
        """Check for relevant keywords based on industry"""
        relevant_keywords = self.industry_keywords[industry] + self.industry_keywords['general']
        
        found_keywords = []
        missing_keywords = []
        
        for keyword in relevant_keywords:
            if keyword.lower() in text:
                found_keywords.append(keyword)
            else:
                missing_keywords.append(keyword)
        
        keyword_score = (len(found_keywords) / len(relevant_keywords)) * 100
        
        return {
            'score': min(keyword_score, 100),
            'found': found_keywords,
            'missing': missing_keywords[:10],  # Top 10 missing keywords
            'total_possible': len(relevant_keywords)
        }
    
    def check_structure(self, content: Dict[str, Any]) -> Dict[str, Any]:
        """Check resume structure and completeness"""
        present_sections = []
        missing_sections = []
        
        for section in self.required_sections:
            if section in content and content[section]:
                present_sections.append(section)
            else:
                missing_sections.append(section)
        
        structure_score = (len(present_sections) / len(self.required_sections)) * 100
        
        return {
            'score': structure_score,
            'present': present_sections,
            'missing': missing_sections
        }
    
    def check_readability(self, text: str) -> Dict[str, Any]:
        """Check text readability using Flesch Reading Ease"""
        if not text.strip():
            return {'score': 0, 'level': 'unreadable'}
        
        try:
            flesch_score = textstat.flesch_reading_ease(text)
            
            if flesch_score >= 80:
                level = 'very easy'
            elif flesch_score >= 70:
                level = 'easy'
            elif flesch_score >= 60:
                level = 'standard'
            elif flesch_score >= 50:
                level = 'fairly difficult'
            elif flesch_score >= 30:
                level = 'difficult'
            else:
                level = 'very difficult'
            
            # Convert to 0-100 scale where higher is better
            readability_score = max(0, min(100, flesch_score))
            
            return {
                'score': readability_score,
                'level': level,
                'flesch_score': flesch_score
            }
        except:
            return {'score': 50, 'level': 'standard'}
    
    def generate_suggestions(self, keyword_analysis: Dict, structure_analysis: Dict, 
                           readability_analysis: Dict) -> List[str]:
        """Generate improvement suggestions based on analysis"""
        suggestions = []
        
        # Keyword suggestions
        if keyword_analysis['score'] < 60:
            suggestions.append(f"Add more relevant keywords. Missing key terms: {', '.join(keyword_analysis['missing'][:5])}")
        
        # Structure suggestions
        if structure_analysis['missing']:
            suggestions.append(f"Add missing sections: {', '.join(structure_analysis['missing'])}")
        
        # Readability suggestions
        if readability_analysis['score'] < 50:
            suggestions.append("Simplify language and use shorter sentences for better readability")
        elif readability_analysis['score'] > 80:
            suggestions.append("Consider using more professional language to match industry standards")
        
        # General ATS suggestions
        suggestions.extend([
            "Use standard section headers (Experience, Education, Skills)",
            "Include specific metrics and achievements",
            "Use standard date formats (MM/YYYY)",
            "Avoid graphics, tables, and unusual fonts",
            "Include relevant certifications and training"
        ])
        
        return suggestions[:8]  # Return top 8 suggestions
    
    def scan(self, content: Dict[str, Any], job_position: str = 'general') -> Dict[str, Any]:
        """Main scanning function"""
        text = self.extract_text(content)
        
        # Detect industry if not specified
        industry = self.detect_industry(text) if job_position == 'general' else job_position.lower()
        
        # Perform analysis
        keyword_analysis = self.check_keywords(text, industry)
        structure_analysis = self.check_structure(content)
        readability_analysis = self.check_readability(text)
        
        # Calculate overall score (weighted average)
        overall_score = int(
            keyword_analysis['score'] * 0.6 +
            structure_analysis['score'] * 0.3 +
            readability_analysis['score'] * 0.1
        )
        
        # Generate suggestions
        suggestions = self.generate_suggestions(keyword_analysis, structure_analysis, readability_analysis)
        
        return {
            'score': overall_score,
            'industry': industry,
            'keywords': keyword_analysis,
            'structure': structure_analysis,
            'readability': readability_analysis,
            'suggestions': suggestions
        }

def main():
    try:
        # Read input from stdin
        input_data = json.loads(sys.stdin.read())
        content = json.loads(input_data['content'])
        job_position = input_data.get('jobPosition', 'general')
        
        # Initialize scanner and perform scan
        scanner = ATSScanner()
        result = scanner.scan(content, job_position)
        
        # Output result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        # Output error as JSON
        error_result = {
            'score': 0,
            'suggestions': [f'Error analyzing resume: {str(e)}'],
            'keywords': {'found': [], 'missing': []},
            'structure': {'present': [], 'missing': []},
            'readability': {'score': 0, 'level': 'error'}
        }
        print(json.dumps(error_result))

if __name__ == '__main__':
    main()