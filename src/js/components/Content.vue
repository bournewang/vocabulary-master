<template>
<div id="vocabulary-master-wrapper" class="p-2">
  <span id="title">Vocabulary Master</span>
  <button @click="click_autoplay" class="btn btn-sm float-lg-end ms-3" :class="autoplay ? 'btn-default' : 'btn-primary'">Autoplay</button>
  <template v-if="current_sentence">
    <div>
      <img :src="audio_icon_url" class="play-btn" @click="sentence_play()">
      {{current_sentence}}
    </div>
    <div id="trans_text" v-if="trans_text">{{trans_text}}</div>
  </template>
  <template v-if="current_word">
    <div>{{current_word}} <img :src="audio_icon_url" alt="" class="play-btn" @click.stop="word_play"></div>
    <div v-for="(phonetic,i) in phonetics">
        <span class='phonetic'>{{phonetic.text}}</span>
        <img :src="audio_icon_url" alt="" class="play-btn" @click.stop="word_play(phonetic.audio)"/>
    </div>
    <div id="definition" v-html="definition"></div>

    <div id="examples" v-if="examples_en.length>0">
      <hr>
      <span>Examples: </span>
      <div v-for="(sentence, i) in examples_en">
          <template class="clearfix" v-if="i<5">
            <img :src="audio_icon_url" class="play-btn" @click="sentence_play(sentence.textContent)">
            <span v-html="sentence.innerHTML"></span>
          </template>
      </div>
    </div>
  </template>

    <audio id="word-audio" controls :src="word_audio_url" :autoplay="autoplay"></audio>
    <audio id="sentence-audio" controls :src="sentence_audio_url" :autoplay="autoplay"></audio>

</div>
</template>

<script>
import axios from "axios";
import jsonp from "jsonp";
import BaiduTransApiSign from "../api/baidu-trans-api-sign";
export default {
  name: "Content",
  data(){
    return {
      current_word: null,
      current_sentence: null,
      definition: null,
      examples_en: [],
      phonetics: [],
      trans_text: null,
      audio_icon_url: null,
      autoplay: false
    }
  },
  mounted() {
    console.log("content mounted +++++==")
    this.audio_icon_url = chrome.runtime.getURL('images/music-32.png')
    this.autoplay = localStorage.getItem("autoplay") == "true"
    console.log("autoplay: "+this.autoplay)
    var that = this
    window.addEventListener("mouseup", function(){
      var string = window.getSelection().toString().trim()
      console.log("mouse up , selected: "+string)
      if (string instanceof String) {
        console.log("instanceof String")
      }else{
        console.log("not a instanceof String")
      }
      if ( (string.length < 1)) {
        console.log("not a string selected, or nothing selected")
        return
      }
      if (string.indexOf(" ") > 0) {
      //  sentences selected
        that.current_sentence = string
        that.translate(string)
        that.current_word = null
        // if (that.autoplay)
        //   that.sentence_play()
      }else {
        that.current_sentence = null
        that.trans_text = null
        that.current_word = string
        axios.get("https://api.dictionaryapi.dev/api/v2/entries/en/" + that.current_word)
            .then(function (res) {
              that.insert_meanings(res.data)
            })
        axios.get("https://vocabulary-master.local/examples.php?word=" + that.current_word).then(function (res) {
          var parser = new DOMParser();
          var doc = parser.parseFromString(res.data, "text/html");
          var container = doc.getElementById("student");
          if (!container) {
            return
          }
          that.examples_en = [];
          console.log("=== get examples successful")
          var examples = container.children //.slice(0,5)
          // console.log("children: "+container.children.length)
          for (var i = 0; i < examples.length; i++) {
            that.examples_en.push(examples[i]);
            console.log("put into examples " + i)
            console.log(examples[i].innerHTML)
            if (i > 4) {
              break;
            }
          }

          // that.word_html = res.data + "<div  class='reference'><a href='https://sentencedict.com/' target='_blank'>https://sentencedict.com/</a> provide data</div>";
        })
      }
    })
  },
  methods: {
    // getExamples(){
    //   console.log("click get Example")
    //   var that = this
    //
    // }
    click_autoplay(){
      this.autoplay = !this.autoplay
      localStorage.setItem("autoplay", this.autoplay)
      console.log("set item autoplay: "+this.autoplay)
    },
    word_play(url){
      console.log("word play: "+this.current_word)
      var audio = document.getElementById('word-audio')
      if (typeof(url) == 'string' && url.length > 0) {
        audio.setAttribute("src", url)
      }
      audio.play()
      // e.stopPropagation
    },
    sentence_play(text){
      if (typeof(text) == 'string' && text.length > 0) {
        this.current_sentence = text
      }
      document.getElementById("sentence-audio").play()
    },
    insert_meanings(res) {
      var exp = res[0];

      // for (var p=0; p<exp.phonetics.length; p++) {
      //   var phonetic = exp.phonetics[p];
      //   if (!phonetic.audio) continue;
      //   // var txt = "";
      //   if (phonetic.text) detail += "<span class='phonetic'>["+phonetic.text+"]</span>";
      //   detail += "<img src='"+this.audio_icon_url+"' class='play-btn' @click='word_play("+phonetic.audio+")'>"
      //   // $("#d-"+word+" ."+class_prefix+"word").after(txt)
      // }
      this.phonetics = exp.phonetics

      var detail = '';
      for (var i=0; i< exp.meanings.length; i++) {
        var meaning = exp.meanings[i];
        detail += "<div class='meaning'>";
        if (meaning.partOfSpeech)
          detail += "<span class='partOfSpeech'>"+ meaning.partOfSpeech + '</span><br/>';

        var def_length = meaning.definitions.length;
        for (var j=0; j<def_length; j++) {
          var definition = meaning.definitions[j];
          detail +=  "<div class='definition'>" + (def_length < 2 ? '' : (j+1)+'. ') + definition.definition + "</div>";
          if (definition.example)
            detail += "<div class='example'>examples: "+ definition.example + "</div>";
          if (definition.synonyms && definition.synonyms.length > 0)
            detail += "<div class='synonyms'>synonyms: "
                + definition.synonyms.slice(0,5).join(', ')
                + (definition.synonyms.length > 5 ? '...' : '')
                + "</div>";
        }
        detail += "</div>";
      }
      // $("#d-"+word+" .meanings").html(detail)
      this.definition = detail
    },
    translate(query){
      var that = this
      axios.get("https://vocabulary-master.local/translate.php?query="+query).then(function(res){
        that.trans_text = res.data
      })

    }
  },
  computed: {
    // sentense_url: function(){
    //   return "https://sentencedict.com/"+this.current_word+".html"
    // },
    word_audio_url: function(){
      return 'https://dict.youdao.com/dictvoice?type=1&audio=' + this.current_word
    },
    sentence_audio_url: function(){
      if (!this.current_sentence) return ""
      return 'https://dict.youdao.com/dictvoice?type=1&audio=' + this.current_sentence.replace(/\s*(\n)?\s*\(?\d+\)?\.?\s+/, "").replace(/\s*(\n)?\s*$/,"")
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../sass/content.scss";
</style>

<style lang="css" scoped>
@import "../../css/bootstrap5.min.css";
@import "../../css/bootstrap5-grid.min.css";
</style>

