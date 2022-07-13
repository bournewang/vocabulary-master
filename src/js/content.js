import Vue from 'vue';

import Content from './components/Content.vue';

// window.onload = function(){
    console.log("===== window.onload====")
    var myDiv = document.createElement("div");
    myDiv.id = 'vocabulary_master_app';
    myDiv.innerHTML = "vocabulary master";
    document.body.appendChild(myDiv);

    const app = new Vue({
        el: '#vocabulary_master_app',
        render: createElement => createElement(Content)
    });
// }
