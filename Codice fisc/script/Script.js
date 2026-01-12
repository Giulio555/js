// Funzione per calcolare il Codice Fiscale
function calcolaCodiceFiscale() {
    // Leggi i valori dagli input
    const cognome = document.getElementById('cognome').value.trim();
    const nome = document.getElementById('nome').value.trim();
    const dataNascita = document.getElementById('dataNascita').value.trim();
    const sesso = document.getElementById('sesso').value;
    const luogoNascita = document.getElementById('luogoNascita').value.trim();
    const risultatoCF = document.getElementById('risultatoCF');
    const message = document.getElementById('message');

    // Controlla se tutti i campi sono compilati
    if (!cognome || !nome || !dataNascita || !sesso || !luogoNascita) {
        message.textContent = "Errore: Compila tutti i campi richiesti.";
        risultatoCF.value = "Codice Fiscale qui";
        return;
    }

    // Simulazione del Codice Fiscale
    const base = (cognome.substring(0, 3) + nome.substring(0, 3)).toUpperCase().replace(/[^A-Z]/g, 'X');
    const cfSimulato = base.substring(0, 6) + 'YY' + dataNascita.substring(0, 2) + sesso + 'A123' + 'B';

    // Mostra il risultato
    risultatoCF.value = cfSimulato;
    message.textContent = "Codice Fiscale generato con successo! (Simulato)";
}