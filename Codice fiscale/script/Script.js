// VARIABILI GLOBALI

// Qui ci salviamo la lista di tutti i comuni letti dal file.
// Sarà un array di oggetti, tipo {nome: "ROMA", codice: "H501"}.
var elencoComuniGlobale = [];


// GESTIONE FILE E INTERFACCIA

// Questa funzione parte quando l'utente carica il file dei comuni.
// Legge il file, lo capisce, e riempie il menu a tendina.
function caricaFileComuni(input) {
    var file = input.files[0];
    var fileStatus = document.getElementById('fileStatus');
    var menuComuni = document.getElementById('menuComuni');

    if (!file) {
        fileStatus.textContent = "Nessun file selezionato.";
        return;
    }

    var lettore = new FileReader();

    // Questa funzione viene chiamata quando il browser finisce di leggere il file.
    lettore.onload = function(evento) {
        var contenutoFile = evento.target.result;
        
        // Dividiamo il file in righe.
        var righe = contenutoFile.split('\n');

        var comuniTrovati = []; // creo un array temporaneo
        for (var i = 0; i < righe.length; i++) {
            var riga = righe[i];
            var parti = riga.split(';');
            
            if (parti.length === 2) {
                var nome = parti[0].trim();
                var codice = parti[1].trim();

                // Facciamo un controllo: il codice catastale deve essere di 4 caratteri.
                if (nome !== '' && codice.length === 4) {
                    // Se la riga è valida, la aggiungo all'array
                    comuniTrovati.push({ nome: nome, codice: codice });
                }
            }
        }

        elencoComuniGlobale = comuniTrovati; // aggiorno la variabile globale

        if (elencoComuniGlobale.length > 0) {
            fileStatus.textContent = "Caricati " + elencoComuniGlobale.length + " comuni.";
            popolaMenuComuni(elencoComuniGlobale);
            menuComuni.disabled = false; // Ri-attiviamo il menu.
        } else {
            // Se qualcosa è andato storto, diamo un messaggio d'errore chiaro.
            fileStatus.textContent = "Nessun comune valido trovato. Formato richiesto: NOMECOMUNE;CODICE (es. Roma;H501)";
            menuComuni.disabled = true; // Il menu rimane bloccato.
        }
    };
    
    // Facciamo partire la lettura del file.
    lettore.readAsText(file);
}

// Riempie il menu a tendina <select> con la lista dei comuni.
function popolaMenuComuni(comuni) {
    var menu = document.getElementById('menuComuni');
    menu.innerHTML = '<option value="" disabled selected>Comune di nascita</option>'; // Puliamo il menu.

    for (var i = 0; i < comuni.length; i++) {
        var comune = comuni[i];
        var opzione = document.createElement('option');
        opzione.value = comune.codice; // il valore è il codice catastale
        opzione.textContent = comune.nome; // il testo è il nome del comune
        menu.appendChild(opzione);
    }
}


// CALCOLO DEL CODICE FISCALE

// Questa è la funzione principale che fa partire tutto.
// Si attiva quando l'utente clicca "Genera".
function generaCodiceFiscale() {
    var messaggio = document.getElementById('message');
    var risultatoCF = document.getElementById('risultatoCF');

    // Puliamo i messaggi vecchi.
    messaggio.textContent = "";
    risultatoCF.value = "Codice Fiscale qui";

    // 1. Prendiamo tutti i dati che l'utente ha inserito.
    var cognome = document.getElementById('cognome').value;
    var nome = document.getElementById('nome').value;
    var dataNascita = document.getElementById('dataNascita').value;
    var sesso = document.getElementById('sesso').value;
    var codiceCatastale = document.getElementById('menuComuni').value;

    // 2. Controlliamo se ha compilato tutto.
    if (cognome === "" || nome === "" || dataNascita === "" || sesso === "" || codiceCatastale === "") {
        alert("Compila tutti i campi prima di generare il codice.");
        return; // esco dalla funzione se manca qualcosa
    }

    // 3. Calcoliamo i pezzi del codice fiscale uno per uno.
    var codiceCognome = calcolaCodiceCognome(cognome);
    var codiceNome = calcolaCodiceNome(nome);
    var codiceData = calcolaCodiceDataNascita(dataNascita, sesso);

    // Se il calcolo della data ha dato errore, mi fermo.
    if (!codiceData) {
        return;
    }
    
    // 4. Mettiamo insieme i primi 15 caratteri.
    var prime15lettere = codiceCognome + codiceNome + codiceData + codiceCatastale;
    
    // Controllino di sicurezza: se non sono 15 caratteri, c'è un problema.
    if (prime15lettere.length !== 15) {
        alert("Errore interno durante il calcolo. Controlla i dati inseriti.");
        return;
    }

    // 5. Calcoliamo l'ultima lettera, quella di controllo.
    var carattereControllo = calcolaCarattereControllo(prime15lettere);

    // 6. Uniamo tutto e abbiamo il codice fiscale.
    var codiceFiscaleCompleto = prime15lettere + carattereControllo;

    // 7. Fatto! Lo mostriamo nella pagina.
    risultatoCF.value = codiceFiscaleCompleto;
}

// Calcola le 3 lettere del cognome per il codice fiscale.
// La regola è: 3 consonanti. Se non ci sono, si prendono le vocali. Se manca ancora, si mette 'X'.
function calcolaCodiceCognome(cognome) {
    var testoPulito = cognome.toUpperCase().replace(/[^A-Z]/g, '');
    var vocali = testoPulito.replace(/[^AEIOU]/g, '');
    var consonanti = testoPulito.replace(/[AEIOU]/g, '');
    
    var codice = consonanti + vocali + "XXX";
    return codice.substring(0, 3);
}

// Calcola le 3 lettere del nome per il codice fiscale.
// Regola un po' diversa: se ci sono 4 o più consonanti, si prende la prima, la terza e la quarta.
// Altrimenti, si fa come per il cognome.
function calcolaCodiceNome(nome) {
    var testoPulito = nome.toUpperCase().replace(/[^A-Z]/g, '');
    var vocali = testoPulito.replace(/[^AEIOU]/g, '');
    var consonanti = testoPulito.replace(/[AEIOU]/g, '');

    if (consonanti.length >= 4) {
        return consonanti[0] + consonanti[2] + consonanti[3];
    } else {
        var codice = consonanti + vocali + "XXX";
        return codice.substring(0, 3);
    }
}

// Calcola i 5 caratteri per la data di nascita e il sesso.
function calcolaCodiceDataNascita(dataStringa, sesso) {
    var partiData = dataStringa.split('/');
    if (partiData.length !== 3 || partiData[2].length !== 4) {
        alert("Formato data non valido. Usa GG/MM/AAAA.");
        return null; // ritorno null per far capire che c'è stato un errore
    }
    
    var giorno = parseInt(partiData[0]);
    var mese = parseInt(partiData[1]);
    var anno = partiData[2];

    // Le ultime due cifre dell'anno.
    var annoCodice = anno.substring(2);

    // La lettera per il mese la prendiamo da questa stringa.
    var tabellaMesi = "ABCDEHLMPRST";
    var meseCodice = tabellaMesi[mese - 1];
    if (!meseCodice) {
        alert("Mese non valido.");
        return null;
    }

    // Se è una donna, al giorno si aggiunge 40.
    if (sesso === 'F') {
        giorno = giorno + 40;
    }
    
    // Il giorno deve essere sempre di due cifre, es: "05".
    var giornoCodice = giorno.toString();
    if (giornoCodice.length < 2) {
        giornoCodice = '0' + giornoCodice;
    }

    return annoCodice + meseCodice + giornoCodice;
}

// Calcola l'ultima lettera del codice fiscale, quella di controllo.
function calcolaCarattereControllo(prime15lettere) {
    var somma = 0;
    // Queste tabelle servono per convertire lettere e numeri secondo le regole.
    var tabellaPari = { '0':0,'1':1,'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'A':0,'B':1,'C':2,'D':3,'E':4,'F':5,'G':6,'H':7,'I':8,'J':9,'K':10,'L':11,'M':12,'N':13,'O':14,'P':15,'Q':16,'R':17,'S':18,'T':19,'U':20,'V':21,'W':22,'X':23,'Y':24,'Z':25 };
    var tabellaDispari = { '0':1,'1':0,'2':5,'3':7,'4':9,'5':13,'6':15,'7':17,'8':19,'9':21,'A':1,'B':0,'C':5,'D':7,'E':9,'F':13,'G':15,'H':17,'I':19,'J':21,'K':2,'L':4,'M':18,'N':20,'O':11,'P':3,'Q':6,'R':8,'S':12,'T':14,'U':16,'V':10,'W':22,'X':25,'Y':24,'Z':23 };
    
    var isPari = false; // uso una variabile per alternare
    for (var i = 0; i < 15; i++) {
        var carattere = prime15lettere[i].toUpperCase();
        
        if (isPari) { // Posizioni pari
            somma = somma + tabellaPari[carattere];
        } else { // Posizioni dispari
            somma = somma + tabellaDispari[carattere];
        }
        isPari = !isPari; // inverto la variabile per il giro dopo
    }

    // Il risultato finale è il resto della divisione per 26.
    var resto = somma % 26;
    var tabellaFinale = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return tabellaFinale[resto];
}
