"""
NSU Course Scheduler - Flask Backend
This module serves as the entry point for the Flask API backend.
"""

from flask import Flask
from flask_cors import CORS
import os
import logging
from api.routes import api_bp

def create_app(test_config=None):
    """
    Create and configure the Flask application.
    
    Args:
        test_config: Test configuration to use instead of instance configuration.
    
    Returns:
        Flask application instance.
    """
    # Create the Flask app
    app = Flask(__name__, instance_relative_config=True)
    
    # Enable CORS for all routes
    CORS(app)
    
    # Set up logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Default configuration
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'nsu_scheduler.sqlite'),
    )
    
    # Load instance config, if it exists
    if test_config is None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)
    
    # Ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass
    
    # Register blueprints
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # Add a simple root route
    @app.route('/')
    def index():
        return {
            'name': 'NSU Course Scheduler API',
            'version': '1.0.0',
            'status': 'online'
        }
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000))) 