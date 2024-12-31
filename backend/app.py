from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import base64
from io import BytesIO
from PIL import Image
import your_model  # Your ML model import
import generate_cam  # Your CAM generation code

app = Flask(__name__)
CORS(app)

@app.route('/analyze', methods=['POST'])
def analyze_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        # Read and process the NPY file
        file_bytes = file.read()
        npy_data = np.load(BytesIO(file_bytes))

        # Process with your model
        prediction, confidence = your_model.predict(npy_data)
        
        # Generate CAM images
        cam_images = generate_cam.get_cam_visualizations(npy_data)
        
        # Convert CAM images to base64
        encoded_images = []
        for img in cam_images:
            buffered = BytesIO()
            Image.fromarray(img).save(buffered, format="JPEG")
            encoded_images.append(base64.b64encode(buffered.getvalue()).decode())

        return jsonify({
            'prediction': prediction,
            'confidence': float(confidence),
            'camImages': encoded_images
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 