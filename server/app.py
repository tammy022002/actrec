from flask import Flask, request, jsonify
from variant_validator import VariantValidator
from flask_cors import CORS
import os
from flask_cors import CORS
app = Flask(__name__)
CORS(app)  # This should handle CORS
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

validator = VariantValidator()

@app.route('/api/validate', methods=['POST'])
def validate_variant():
    data = request.get_json()
    variant = data.get('variant')
    assembly = data.get('assembly', 'GRCh38')
    transcript_set = data.get('transcript_set', 'mane')
    
    if not variant:
        return jsonify({'error': 'Variant input is required'}), 400
    
    try:
        result = validator.validate_variant(variant, assembly, transcript_set)
        formatted_result = validator.format_response(result)
        return jsonify({
            'raw': result,
            'formatted': formatted_result
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/examples', methods=['GET'])
def get_examples():
    examples = [
        "ENST00000225964.10:c.589G>T",
        "NC_000017.10:g.48275363C>A",
        "17-50198002-C-A",
        "17:50198002:C:A",
        "GRCh38-17-50198002-C-A",
        "GRCh38:17:50198002:C:A",
        "chr17:50198002C>A",
        "chr17:50198002C>A(GRCh38)",
        "chr17(GRCh38):50198002C>A",
        "chr17:g.50198002C>A"
    ]
    return jsonify(examples)

if __name__ == '__main__':
    app.run(debug=True, port=5000)