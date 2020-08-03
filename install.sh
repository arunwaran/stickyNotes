#!/bin/bash
echo "starting to install..."
npm install --save-dev electron
rm package-lock.json
git clone https://github.com/arunwaran/stickyNotes.git
mv node_modules stickyNotes
cd stickyNotes
echo "Installation Finished!"
npm start
