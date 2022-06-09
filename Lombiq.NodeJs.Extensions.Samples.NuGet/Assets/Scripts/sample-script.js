// Remove the "x" to trigger an "Unnamed function" warning.
(function x() {
    // Put into one line to trigger a custom rule in this project with a max line length of 120.
    const thisIsAnUtterlyLongLine = 'A wonderfully long line to trigger a warning when the max line length is set to ' +
        '120 in .eslintrc.json';
    // Uncomment the next line to trigger "console statement" warning.
    console.log(thisIsAnUtterlyLongLine);
    return thisIsAnUtterlyLongLine;
})();
