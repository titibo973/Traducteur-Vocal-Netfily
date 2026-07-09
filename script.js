const textTop = document.getElementById('text-top');
const textBottom = document.getElementById('text-bottom');
const langTop = document.getElementById('langTop');
const langBottom = document.getElementById('langBottom');
const engineSelect = document.getElementById('engineSelect');

// Gestion des couleurs
const colorInactif = document.getElementById('colorInactif');
const colorActif = document.getElementById('colorActif');

function updateButtonColors(btn, isActive) {
    btn.style.backgroundColor = isActive ? colorActif.value : colorInactif.value;
}

async function lancerTraduction(cote) {
    const btn = (cote === 'top') ? document.getElementById('btnTop') : document.getElementById('btnBottom');
    const sourceCode = (cote === 'top') ? langTop.value : langBottom.value;
    const cibleCode = (cote === 'top') ? langBottom.value : langTop.value;

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = sourceCode;
    
    recognition.onstart = () => {
        btn.classList.add('active');
        updateButtonColors(btn, true);
    };

    recognition.onend = () => {
        btn.classList.remove('active');
        updateButtonColors(btn, false);
    };

    recognition.start();

    recognition.onresult = async (event) => {
        const texte = event.results[0][0].transcript;
        
        const response = await fetch('/api/traductions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                texte, 
                source: sourceCode.split('-')[0], 
                cible: cibleCode.split('-')[0], 
                moteur: engineSelect.value 
            })
        });
        
        const data = await response.json();
        if (cote === 'top') { textTop.innerText = texte; textBottom.innerText = data.traduction; }
        else { textBottom.innerText = texte; textTop.innerText = data.traduction; }
        
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(data.traduction);
        utterance.lang = cibleCode;
        window.speechSynthesis.speak(utterance);
    };
}

// Initialisation des couleurs au chargement
document.querySelectorAll('.btn-record').forEach(btn => updateButtonColors(btn, false));
colorInactif.addEventListener('input', () => document.querySelectorAll('.btn-record').forEach(b => !b.classList.contains('active') && updateButtonColors(b, false)));
colorActif.addEventListener('input', () => document.querySelectorAll('.btn-record').forEach(b => b.classList.contains('active') && updateButtonColors(b, true)));