const spawn = require('child_process').spawn;

exports.handler = async (event, context) => {
  const pythonProcess = spawn('python', ['main.py']);
  pythonProcess.stdout.on('data', (data) => {
    console.log(`Python script output: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python script error: ${data}`);
  });

  return {
    statusCode: 200,
    body: 'Python server started',
  };
};