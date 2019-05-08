var watch = require('node-watch');
var exec = require('child_process').exec, child;
var stq = require('sequential-task-queue');
var queue = new stq.SequentialTaskQueue();

var SCP = process.env.SCP_PATH || 'scp';
var FC_ENAIL_SERVER = process.env.FC_ENAIL_SERVER || '172.19.0.31';
var FC_ENAIL_PATH = process.env.FC_ENAIL_PATH || './fc-enail/fc-enail/';
var FC_ENAIL_USER = process.env.FC_ENAIL_USER || 'pi';

setTimeout(() => {
  console.log('start watching');
  watch('./build', { recursive: true }, function(evt, name) {
    if (FC_ENAIL_SERVER && FC_ENAIL_PATH && FC_ENAIL_USER && SCP) {
      var cmd = `${SCP} ${name} ${FC_ENAIL_USER}@${FC_ENAIL_SERVER}:${FC_ENAIL_PATH}${name.replace(/\\/g, '/')}`;

      queue.push(() => {
        return new Promise(resolve => {
          exec(cmd, (error, stdout, stderr) => {
            if (error) {
              console.log('Error: %s', error);
            } else {
              console.log('Copied: %s', name);
            }    
            resolve();
          });
        });
          
      });
    }
  })
}, 5000);