# Clinical Report Analyzer - Web Application

A web-based longitudinal clinical report analyzer that helps identify trends and persistent abnormalities across multiple patient visits.

## Features

- 📊 **Multi-Visit Analysis**: Analyze clinical data from multiple patient visits
- 📈 **Trend Detection**: Identify increasing, decreasing, or stable trends
- ⚠️ **Abnormality Detection**: Highlight parameters outside normal ranges
- 💡 **Lifestyle Guidance**: Receive educational suggestions for abnormal parameters
- 🎨 **Modern UI**: Clean, responsive interface with professional medical design

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

## Running the Application

1. Start the Flask server:
```bash
python app.py
```

2. Open your browser and navigate to:
```
http://localhost:5000
```

## Usage

1. **Add Visits**: Click "Add Visit" to add multiple clinical reports
2. **Enter Data**: 
   - Visit date (required)
   - Glucose level (mg/dL) - optional
   - Cholesterol level (mg/dL) - optional
   - Blood Pressure systolic (mmHg) - optional
3. **Analyze**: Click "Analyze Reports" to generate comprehensive analysis
4. **Review Results**: 
   - View trends for each parameter
   - See abnormalities highlighted
   - Read lifestyle guidance for abnormal parameters

## Normal Ranges

- **Glucose**: 70-100 mg/dL (fasting)
- **Cholesterol**: 0-200 mg/dL (total)
- **Blood Pressure**: 90-120 mmHg (systolic)

## Project Structure

```
├── app.py                  # Flask backend with API endpoints
├── templates/
│   └── index.html         # Main HTML page
├── static/
│   ├── styles.css         # CSS styling
│   └── script.js          # JavaScript functionality
├── requirements.txt       # Python dependencies
└── README.md             # This file
```

## Disclaimer

⚠️ **IMPORTANT**: This application is for educational purposes only. It does NOT constitute medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals for medical decisions.

## Technologies Used

- **Backend**: Python, Flask
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Data Processing**: Pandas, NumPy
