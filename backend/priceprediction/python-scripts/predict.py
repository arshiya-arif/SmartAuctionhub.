
import sys
import os
import joblib
import pandas as pd

script_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(script_dir)
model_path = os.path.join(parent_dir, 'bid_prediction_model.pkl')

try:
    # Load model
    model = joblib.load(model_path)
    
    # Get inputs from Node.js
    openbid = float(sys.argv[1])
    bidderrate = int(sys.argv[2])
    bidtime_days = float(sys.argv[3])
  
    hour = (bidtime_days % 1) * 24
    weekday = (bidtime_days // 1) % 7

    input_data = pd.DataFrame([[openbid, bidderrate, hour, weekday]],
                            columns=['openbid', 'bidderrate', 'hour', 'weekday'])
 
    raw_prediction = model.predict(input_data)[0]
    
  
    minimum_acceptable = openbid * 1.05 
    final_prediction = max(raw_prediction, minimum_acceptable)
    
 
    if bidtime_days < 1:
        final_prediction *= 1.1  
    
    print(final_prediction)
    
except Exception as e:
    print(f"ERROR: {str(e)}", file=sys.stderr)
    sys.exit(1)