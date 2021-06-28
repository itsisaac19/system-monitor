import { cpu, mem, processes } from "systeminformation";
import { cpuUsage} from "os-utils";

import computerName from "computer-name";
import { os } from 'platform';

import { ipcRenderer } from "electron";

document.title = '';
document.body.innerHTML = `
<style>
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  margin: 30px auto auto auto;
  padding: 32px 26px 0;
  background-color: rgba(23, 25, 32);
}
::-webkit-scrollbar {
    width: 0px;
    background: transparent; /* make scrollbar transparent */
}
body * {
  user-select: none;
}
.cpuInfo {
  position: relative;
  top: 0px;
  transition: 0.3s ease;
}
.platform {
  margin-bottom: 0;
}
.processor {
  margin-block-start: 0;
  margin-top: 12px;
}
.usage {
  position: relative;
  top: 0px;
  transition: 0.3s ease;
  font-weight: 500;
  color: #4a4a4a;
  margin-top: 0px;
  margin-bottom: 8px;
  letter-spacing: 1px;
}
.usage span {
  color: #b7b7b7;
  font-weight: bold;
}
.memory {
  letter-spacing: 1px;
  margin-block-start: 0;
  margin-top: 10px;
  margin-bottom: 0px;
  position: relative;
  top: 0px;
  transition: 0.3s ease;
  font-weight: 500;
  color: #4a4a4a;
}
.memory span {
  color: #b7b7b7;
  font-weight: bold;
}
#custom-titleBar-Windows {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
}
#custom-titleBar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 37px;
  -webkit-app-region: drag;
  white-space: nowrap;
  display: grid;
  grid-template-columns: 1fr 1fr;
  font-size: 12px;
  font-weight: 500;
  color: rgb(216, 216, 216);
}
#custom-titleBar > span {
  margin: auto 0 auto auto;
}
#custom-titleBar > span:last-child {
  margin: auto auto auto 0;
}
@media (max-width: 468px) {
  #custom-titleBar {
    left: 15%;
  }
}
.waiting {
  opacity: 0;
  top: 30px;
}
.taskListLabel {
  margin-top: 30px;
  display: grid;
  grid-template-rows: 1fr;
  column-gap: 20px;
  grid-template-columns: 1fr auto auto;
  color: #4a4a4a;
  font-weight: 500;
}
.taskListLabel > span {
  font-size: 12px;
  letter-spacing: 1px;
}
.taskList {
  margin-top: 20px;
  height: min-content;
  width: 100%;
}
.task {
  border-top: 1px solid rgb(41, 44, 53);
  width: 100%;
  height: 35px;
  display: grid;
  grid-template-rows: 1fr;
  column-gap: 20px;
  grid-template-columns: 1fr auto 30px;

  color: #b7b7b7;
}

.task span {
  white-space: nowrap;
  font-size: 12px;
  height: 100%;
  padding: 0 0px;
  margin-right: 0px;
  text-align: right;
  display: grid;
  place-items: center;
}
.task span:first-child {
  margin: auto auto auto 0 
}
.task span:not(:first-child):not(:last-child) {
  margin: auto 60px auto auto;
}
.task:last-child {
  border-bottom: 1px solid rgb(41, 44, 53);
}
</style>
<h2 class="usage" >CPU ...</h2>
<h2 class="memory" >RAM ...</h2>
<div class="taskListLabel">
<span> PROCESS </span>
<span class="CPULabel"> CPU (%) </span>
<span class="memoryLabel"> MEMORY (%) </span>
</div>
<div class="taskList">

</div>
<div id="custom-titleBar"></div>
<div id="custom-titleBar-Windows"></div>
`


var pCores = 1;

var hasAdvancedView = false;
var sortByMem = false;
var sortByCPU = true;

const el = (idOrClass) => {
  return document.querySelector(`${idOrClass}`)
}

if (process.platform != 'darwin') {
  const ElectronTitlebarWindows = require('electron-titlebar-windows');
  const titlebar = new ElectronTitlebarWindows({
    backgroundColor: '#000'
  });

  titlebar.appendTo(document.querySelector("#custom-titleBar-Windows"));

  titlebar.on('close', function(e) {
    ipcRenderer.send('windowController', 'close')
  });
  titlebar.on('minimize', function(e) {
    ipcRenderer.send('windowController', 'minimize')
  });
  titlebar.on('maximize', function(e) {
    ipcRenderer.send('windowController', 'maximize')
  });
  titlebar.on('fullscreen', function(e) {
    ipcRenderer.send('windowController', 'fullscreen')
  });
}



document.querySelector("#custom-titleBar").innerHTML = `<span>${computerName()}&nbsp;</span>`
document.querySelector("#custom-titleBar").innerHTML += `<span style="color:#b7b7b7;">—&nbsp;${os}</span>`

el('#custom-titleBar').addEventListener('dblclick', (e) => {
  ipcRenderer.send('windowController', 'maximize')
})

el('.CPULabel').addEventListener('click', (e) => {
  el('.memoryLabel').innerHTML = 'MEMORY (%)'
  
  if (el('.CPULabel').innerHTML == 'CPU (%) ▼') {
    el('.CPULabel').innerHTML = 'CPU (%) &#9650;'
  } else if (el('.CPULabel').innerHTML == 'CPU ▲') {
    el('.CPULabel').innerHTML = 'CPU (%) &#9660;'
  } else {
    el('.CPULabel').innerHTML = 'CPU (%) &#9660;'
  }

  el('.CPULabel').style.color = '#b7b7b7'
  el('.memoryLabel').style.color = null
  sortByMem = false;
  sortByCPU = true;
})

el('.memoryLabel').addEventListener('click', (e) => {
  el('.CPULabel').innerHTML = 'CPU (%)'

  if (el('.memoryLabel').innerHTML == 'MEMORY (%) ▼') {
    el('.memoryLabel').innerHTML = 'MEMORY (%) &#9650;'
  } else if (el('.CPULabel').innerHTML == 'MEMORY (%) ▲') {
    el('.memoryLabel').innerHTML = 'MEMORY (%) &#9660;'
  } else {
    el('.memoryLabel').innerHTML = 'MEMORY (%) &#9660;'
  }
  
  el('.memoryLabel').style.color = '#b7b7b7'
  el('.CPULabel').style.color = null
  sortByMem = true;
  sortByCPU = false;
})


cpu().then(data => {
  pCores = data.physicalCores;
});

class Task {
  constructor(process) {
    this.name = process.name
    this.cpuUsage = (process.cpu / pCores).toFixed(1);
    this.memUsage = process.mem.toFixed(1)
  }
  HTML() {
    let wrapper = document.createElement("div");
    wrapper.className = "task"
    
    for (var key in this) {
      let span = document.createElement("span");
      span.innerHTML = this[key];
      wrapper.appendChild(span)
    }
    
    return wrapper;
  }
}

const compareAscending = ( key ) => {
  return ( a, b ) => {
    if ( a[key] < b[key]  ){
      return -1;
    }
    if ( a[key]  > b[key]  ){
      return 1;
    }
    return 0
  }
} 
const compareDescending = ( key ) => {
  return ( a, b ) => {
    if ( a[key] < b[key]  ){
      return 1;
    }
    if ( a[key]  > b[key]  ){
      return -1;
    }
    return 0
  }
} 

const reloadData = () => {
  cpuUsage((decimal) => { 
    document.querySelector(".usage").innerHTML = `CPU&nbsp; <span>${(decimal * 100).toFixed(0)}%</span>`;
  });

  mem().then(memData => {
    document.querySelector(".memory").innerHTML = `RAM&nbsp; <span>${(memData.active / 1000000000).toFixed(1)} / ${(memData.total / 1000000000).toFixed(1)} GB</span>`;
  })
  
  processes().then(data => {
    el('.taskList').innerHTML = null

    var views = hasAdvancedView ? data.running + 10 : data.running + 5;

    if (sortByCPU == true) {
      if (el('.CPULabel').innerHTML.trim() == 'CPU (%)') {
        data.list.sort(compareDescending('cpu'))
      } else if (el('.CPULabel').innerHTML == 'CPU (%) ▼') {
        data.list.sort(compareDescending('cpu'))
      } else {
        data.list.sort(compareAscending('cpu'))
      }
    } 
    if (sortByMem == true) {
      if (el('.memoryLabel').innerHTML.trim() == 'MEMORY (%)') {
        data.list.sort(compareDescending('mem'))
      } else if (el('.memoryLabel').innerHTML == 'MEMORY (%) ▼') {
        data.list.sort(compareDescending('mem'))
      } else {
        data.list.sort(compareAscending('mem'))
      }
    };

    for (let i = 0; i < 7; i++) {
      el('.taskList').appendChild(new Task(data.list[i]).HTML())
    }
  })

  setTimeout(reloadData, 2000);
};
reloadData();