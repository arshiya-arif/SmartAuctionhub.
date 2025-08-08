const { PythonShell } = require('python-shell');
const path = require('path');

const predictBid = async (openbid, bidderrate, bidtime_days) => {
  const options = {
    pythonPath: process.platform === 'win32' ? 'python' : 'python3',
    scriptPath: path.join(__dirname, '../priceprediction/python-scripts'),
    args: [openbid, bidderrate, bidtime_days],
    pythonOptions: ['-u']
  };
  

  try {
    const results = await PythonShell.run('predict.py', options);
    if (results && results.length > 0) {
      return parseFloat(results[0]);
    }
    throw new Error('No prediction results returned');
  } catch (error) {
    console.error('Prediction failed:', error);
    throw new Error(`Prediction error: ${error.message}`);
  }
};

module.exports = { predictBid };