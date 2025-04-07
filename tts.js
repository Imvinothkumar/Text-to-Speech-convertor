const fileUpload = document.getElementById("fileUpload");
const filePreview = document.getElementById("filePreview");
const textInput = document.getElementById("textInput");
const voiceSelect = document.getElementById("voiceSelect");
const synth = window.speechSynthesis;

let utterance;

fileUpload.addEventListener("change", async function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  const fileType = file.name.split('.').pop().toLowerCase();

  reader.onload = async function (e) {
    const content = e.target.result;

    if (fileType === "txt" || fileType === "html") {
      filePreview.innerHTML = content;
      textInput.value = fileType === "txt" ? content : filePreview.textContent;
    } else if (fileType === "docx") {
      mammoth.convertToHtml({ arrayBuffer: file })
        .then(result => {
          filePreview.innerHTML = result.value;
          textInput.value = filePreview.textContent;
        });
    } else if (fileType === "pdf") {
      const loadingTask = pdfjsLib.getDocument({ data: content });
      const pdf = await loadingTask.promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(" ") + "\n";
      }
      filePreview.textContent = text;
      textInput.value = text;
    } else if (fileType === "pptx" || fileType === "ppt") {
      filePreview.innerHTML = "Preview not available for PPT files.";
      textInput.value = `PPT file loaded: ${file.name}`;
    } else {
      filePreview.innerHTML = "Unsupported file type.";
    }
  };

  if (fileType === "pdf") {
    reader.readAsArrayBuffer(file);
  } else {
    reader.readAsArrayBuffer(file);
  }
});

document.getElementById("speakBtn").addEventListener("click", () => {
  const text = textInput.value;
  if (!text) return;
  utterance = new SpeechSynthesisUtterance(text);

  const selectedVoice = voiceSelect.value;
  if (selectedVoice) {
    const voice = synth.getVoices().find(v => v.name === selectedVoice);
    if (voice) {
      utterance.voice = voice;
    }
  }

  synth.speak(utterance);
});

document.getElementById("pauseBtn").addEventListener("click", () => {
  synth.pause();
});

document.getElementById("resumeBtn").addEventListener("click", () => {
  synth.resume();
});

document.getElementById("stopBtn").addEventListener("click", () => {
  synth.cancel();
});

window.speechSynthesis.onvoiceschanged = () => {
  const voices = synth.getVoices();
  voices.forEach(voice => {
    const option = document.createElement("option");
    option.value = voice.name;
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });
};
