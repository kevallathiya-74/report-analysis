from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import pandas as pd
from datetime import datetime

app = Flask(__name__)
CORS(app)

class LongitudinalClinicalAnalyzer:
    """
    Longitudinal Clinical Report Analysis Assistant
    Analyzes multiple medical reports across patient visits to identify trends,
    persistent abnormalities, and provide conservative educational insights.
    """
    
    def __init__(self):
        self.reports = []
        self.patient_info = {
            'name': None,
            'id': None,
            'age': None,
            'gender': None,
            'report_type': None
        }
        
    def add_report(self, report_data, visit_date):
        """Add a clinical report for analysis"""
        self.reports.append({
            'date': pd.to_datetime(visit_date),
            'data': report_data
        })
        self.reports.sort(key=lambda x: x['date'])
    
    def set_patient_info(self, name, patient_id, age, gender, report_type):
        """Set patient information and report type"""
        self.patient_info['name'] = name
        self.patient_info['id'] = patient_id
        self.patient_info['age'] = age
        self.patient_info['gender'] = gender
        self.patient_info['report_type'] = report_type
        
    def identify_trends(self, parameter):
        """Identify trends for a specific parameter across visits"""
        values = []
        dates = []
        
        for report in self.reports:
            if parameter in report['data']:
                values.append(report['data'][parameter])
                dates.append(report['date'].strftime('%Y-%m-%d'))
        
        if len(values) < 2:
            return None
        
        trend = "increasing" if values[-1] > values[0] else "decreasing" if values[-1] < values[0] else "stable"
        return {
            'dates': dates,
            'values': values,
            'trend': trend,
            'change': round(values[-1] - values[0], 2)
        }
    
    def detect_persistent_abnormalities(self, parameter, normal_range):
        """Detect if a parameter remains outside normal range across visits"""
        abnormal_visits = []
        
        for report in self.reports:
            if parameter in report['data']:
                value = report['data'][parameter]
                if value < normal_range[0] or value > normal_range[1]:
                    abnormal_visits.append({
                        'date': report['date'].strftime('%Y-%m-%d'),
                        'value': value,
                        'status': 'low' if value < normal_range[0] else 'high'
                    })
        
        return abnormal_visits
    
    def generate_analysis_report(self, parameters_with_ranges):
        """Generate comprehensive longitudinal analysis report"""
        if not self.reports:
            return None
            
        analysis = {
            'patient_info': self.patient_info,
            'total_visits': len(self.reports),
            'date_range': {
                'start': self.reports[0]['date'].strftime('%Y-%m-%d'),
                'end': self.reports[-1]['date'].strftime('%Y-%m-%d')
            },
            'parameters': {}
        }
        
        for parameter, normal_range in parameters_with_ranges.items():
            trend_info = self.identify_trends(parameter)
            abnormalities = self.detect_persistent_abnormalities(parameter, normal_range)
            
            if trend_info:
                analysis['parameters'][parameter] = {
                    'normal_range': normal_range,
                    'trend': trend_info,
                    'abnormalities': abnormalities,
                    'abnormal_count': len(abnormalities)
                }
        
        return analysis
    
    def provide_general_guidance(self, abnormal_parameters):
        """Provide conservative, non-prescriptive lifestyle guidance"""
        guidance_db = {
            'glucose': {
                'care': ['Monitor carbohydrate intake', 'Maintain regular meal timing', 'Stay physically active'],
                'avoid': ['Excessive sugar and refined carbs', 'Prolonged fasting or irregular meals', 'Sedentary lifestyle']
            },
            'cholesterol': {
                'care': ['Include fiber-rich foods', 'Choose healthy fats (olive oil, nuts)', 'Regular exercise'],
                'avoid': ['Trans fats and excessive saturated fats', 'Smoking', 'Excessive alcohol']
            },
            'blood_pressure': {
                'care': ['Reduce sodium intake', 'Manage stress', 'Regular cardiovascular exercise'],
                'avoid': ['Excessive salt', 'Chronic stress', 'Excessive caffeine']
            }
        }
        
        guidance = {}
        for param in abnormal_parameters:
            if param in guidance_db:
                guidance[param] = guidance_db[param]
        
        return guidance

# Global analyzer instance
analyzer = None

@app.route('/')
def index():
    """Serve the main HTML page"""
    return render_template('index.html')

@app.route('/api/analyze', methods=['POST'])
def analyze():
    """Analyze clinical data"""
    global analyzer
    
    try:
        data = request.json
        reports = data.get('reports', [])
        patient_info = data.get('patient_info', {})
        
        if not reports:
            return jsonify({'error': 'No reports provided'}), 400
        
        # Create new analyzer instance
        analyzer = LongitudinalClinicalAnalyzer()
        analyzer.set_patient_info(
            patient_info.get('name', 'Unknown'),
            patient_info.get('id', 'N/A'),
            patient_info.get('age', 'N/A'),
            patient_info.get('gender', 'N/A'),
            patient_info.get('report_type', 'General')
        )
        
        # Add reports
        for report in reports:
            report_data = {}
            if report.get('glucose'):
                report_data['glucose'] = float(report['glucose'])
            if report.get('cholesterol'):
                report_data['cholesterol'] = float(report['cholesterol'])
            if report.get('blood_pressure'):
                report_data['blood_pressure'] = float(report['blood_pressure'])
            
            if report_data:
                analyzer.add_report(report_data, report['date'])
        
        # Define normal ranges
        parameters_with_ranges = {
            'glucose': (70, 100),
            'cholesterol': (0, 200),
            'blood_pressure': (90, 120)
        }
        
        # Generate analysis
        analysis = analyzer.generate_analysis_report(parameters_with_ranges)
        
        if not analysis:
            return jsonify({'error': 'Unable to generate analysis'}), 400
        
        # Get abnormal parameters
        abnormal_parameters = [
            param for param, info in analysis['parameters'].items()
            if info['abnormal_count'] > 0
        ]
        
        # Get guidance
        guidance = analyzer.provide_general_guidance(abnormal_parameters)
        
        return jsonify({
            'analysis': analysis,
            'guidance': guidance,
            'abnormal_parameters': abnormal_parameters
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
