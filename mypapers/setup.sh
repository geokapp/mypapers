#!/bin/bash

# User configurable parameters.
CONFIGDIR="$HOME/.mypapers"
TOPDIR="$HOME/mypapers"
ALLDIR="$TOPDIR/All"
CATEGORIESDIR="$TOPDIR/Categories"
STRUCTUREDIR="$TOPDIR/Structure"
NOTESDIR="$TOPDIR/Notes"
BIBDIR="$TOPDIR/Bib"

# Generate the basic directory structure.
CONFIGFILE=$CONFIGDIR/mypapers.ini
SETUPDIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
mkdir -p $CONFIGDIR $ALLDIR $CATEGORIESDIR $STRUCTUREDIR $NOTESDIR $BIBDIR
echo "Info: You should place your papers in $ALLDIR. Check README.md for help in choosing filenames."
touch $STRUCTUREDIR/structure.txt
echo "Info: You should place your structure in $STRUCTUREDIR/structure.txt."
touch $BIBDIR/bibliography.bib
echo "Info: You should place you bib data in $BIBDIR/bibliography.bib"

# Generate an initial configuration file.
echo "[Global]" > $CONFIGFILE
echo "TopDir = $TOPDIR" >> $CONFIGFILE
echo "AllDir = $ALLDIR" >> $CONFIGFILE
echo "CategoriesDir = $CATEGORIESDIR" >> $CONFIGFILE
echo "StructureDir = $STRUCTUREDIR" >> $CONFIGFILE
echo "NotesDir = $NOTESDIR" >> $CONFIGFILE
echo "BibDir = $BIBDIR" >> $CONFIGFILE
echo "Info: A config file $CONFIGFILE was generated."
cp -r $SETUPDIR/../mypapers $TOPDIR/.
echo "Info: Run mypapers as follows: $ python $TOPDIR/mypapers/mypapers.py."

# Generate an initial configuration file.
echo "[Global]" > $CONFIGFILE
echo "TopDir = $TOPDIR" >> $CONFIGFILE
echo "AllDir = $ALLDIR" >> $CONFIGFILE
echo "CategoriesDir = $CATEGORIESDIR" >> $CONFIGFILE
echo "StructureDir = $STRUCTUREDIR" >> $CONFIGFILE
echo "NotesDir = $NOTESDIR" >> $CONFIGFILE
echo "BibDir = $BIBDIR" >> $CONFIGFILE

echo "Info: Setup completed successfuly."
exit

