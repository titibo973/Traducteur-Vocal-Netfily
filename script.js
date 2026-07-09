const textTop = document.getElementById('text-top');
const textBottom = document.getElementById('text-bottom');
const langTop = document.getElementById('langTop');
const langBottom = document.getElementById('langBottom');
const engineSelect = document.getElementById('engineSelect');
const speedRange = document.getElementById('speedRange');

async function lancerTraduction(cote) {
    const btn = event.target;
    const sourceCode = (cote === 'top') ? langTop.value : langBottom.value;
    const cibleCode = (cote === 'top') ? langBottom.value : langTop.value;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = sourceCode;

    // Feedback : Vert quand ça écoute
    btn.style.backgroundColor = '#27ae60'; 
    btn.innerText = '🔴';
    
    recognition.start();

    recognition.onresult = async (event) => {
        const texte = event.results[0][0].transcript;
        if (cote === 'top') textBottom.innerText = "...";
        else textTop.innerText = "...";

        try {
            const response = await fetch('/api/traductions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    texte, source: sourceCode.split('-')[0], cible: cibleCode.split('-')[0], moteur: engineSelect.value 
                })
            });
            const data = await response.json();
            
            if (cote === 'top') { textTop.innerText = texte; textBottom.innerText = data.traduction; }
            else { textBottom.innerText = texte; textTop.innerText = data.traduction; }
            
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(data.traduction);
            utterance.lang = cibleCode;
            utterance.rate = parseFloat(speedRange.value);
            window.speechSynthesis.speak(utterance);
        } catch (err) { console.error(err); }
    };

    recognition.onend = () => {
        btn.style.backgroundColor = '#e74c3c';
        btn.innerText = '🎙️';
    };
}