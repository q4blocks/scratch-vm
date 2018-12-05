window.onhashchange = function () {
    location.reload();
};

const serverUrl = 'http://localhost:3000/project-data';
const sendReqToSave = async function (projectId, sb3File, xml) {
    var formData = new FormData();
    formData.append('_id', projectId);
    formData.append('sb3', sb3File);
    formData.append('xml', xml);
    const response = await fetch(serverUrl, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        body: formData
    });

    return response;
};

const createUploadTask = function (projectId, callback) {
    return async function () {
        const downloadLink = document.createElement('a');
        document.body.appendChild(downloadLink);
        const xml = await new Promise(function (resolve, reject) {
            resolve(getProgramXml());
        });
        Scratch.vm.saveProjectSb3().then(content => {
            const url = window.URL.createObjectURL(content);
            downloadLink.href = url;
            downloadLink.download = "filename";
            return sendReqToSave(projectId, content, xml);
        }).then(() => callback());
    };
}


window.onload = async function () {
    const projectIdDom = document.getElementById("projectId");
    let projectId = projectIdDom.innerText = location.hash.substring(1, location.hash.length);
    let dataStat = await fetch(`http://localhost:3000/data/${projectId}`).then(res => res.json());
    configureProjectResourceUrl({LOCAL_ASSET:dataStat.project_dir_exists});
    
//     let wsReadyCallback = createUploadTask(projectId, function () { updateStatus(projectId, 'DATA', 'COMPLETE') });
    loadProjectAndRunTask({
        projectId,
        wsReadyCallback: ()=>{},
        requiredAnalysisUi:false
    });
};

const saveButton = document.getElementById("save");
saveButton.addEventListener("click", function(){
    const projectIdDom = document.getElementById("projectId");
    let projectId = projectIdDom.innerText = location.hash.substring(1, location.hash.length);
    createUploadTask(projectId, function () { 
        console.log('DONE UPDATED PROJECT DATA!');
    })();
});


const greenFlagButton = document.getElementById("greenFlag");
greenFlagButton.addEventListener("click", function(){
    Scratch.vm.start();
    Scratch.vm.greenFlag();
});

const stopAllButton = document.getElementById("stopAll");
stopAllButton.addEventListener("click", function(){
    Scratch.vm.stopAll();
    clearTimeout(Scratch.vm.runtime._steppingInterval);
});
