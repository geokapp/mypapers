<img src="http://cs.uoi.gr/~gkappes/files/mypapers.jpg" align="right" />
mypapers - A simple tool to manage and organize papers
===============================================

mypapers is a simple tool written in python that helps you to organize research material, such as papers. It lets you to store your papers under a single directory and tag them with category terms. It also lets you to provide a structure file that contains a hierarchy of categories and subcategories. The tool generates the directory hierarchy that matches the provided category hierarchy and links each paper to the right category directories according to the specified tags. The tool also generates an index html page with all your papers organized under the specified category tags. Finally,  for each paper the tool extracts bibliographic information from a bibtex file.

Requirements
-----------------

The tool requires **python 2.7** or higher to run. It also uses the following python packages. Make sure that they are installed into your system:

- ConfigParser
- getopt
- os
- re
- sys
- pybtex

> **Note:**
> You can check if a python module 'module_name' exists by running in a terminal:
> 
> ```
> python -c "help('modules');" | grep module_name
>```

Your can use **pip** to install a missing python package or your distribution's package manager. For example, pybtex can be installed by using pip: 
```
$ pip install pybtex
```
or by using your distribution's package manager. For example, in a Debian-based system run:
```
# apt-get install pybtex
```

Installation and configuration
-----------------------------------

To install mypapers into your working environment use the *setup.sh* script under *mypapers/mypapers* directory. Before running the script you can modify some of its parameters to match your requirements:

- *CONFIGDIR*: Specify the directory under which the configuration file *mypapers.ini* will be stored.
- *TOPDIR*: Specify the top directory.
- *ALLDIR*: Specify the directory that will contain all your papers. 
- *CATEGORIESDIR*: Specify the directory under which mypapers will generate the category structure. 
- *STRUCTUREDIR*: Specify the directory under which mypapers will find the file *structure.txt*. This file can be populated with a hierarchy of categories and subcategories. 
- *NOTESDIR*: Specify the directory where you will put notes for each paper.
- *BIBDIR*: Specify the directory that will contain the file *bibliography.bib*. You can populate this file with bibtex data for your papers. 

> **Note:**
>  By default, mypapers generates a *.mypapers* and a *mypapers* directory under your user's home directory. *.mypapers* contains the configuration file *mypapers.ini*, while mypapers contains the following directories:
>  
>  - *All*: Under this directory you should put all your papers.
>  - *Categories*: mypapers will create the category hierarchy under this directory.
>  - *Structure*: This directory contains the file *structure.txt* that will describe the category hierarchy.
>  - *Notes*: This directory will contain note files for each one of your papers.
>  - *Bib*: This directory contains the *bibliography.bib* file. You can populate this file with bibtex data.
>  - *mypapers*: This directory contains the mypapers tool. You should not remove this directory or alter its contents for the tool to function properly.  

After installation, you can change the above directories by modifying the  configuration file *mypapers.ini*.

Usage
-------

Before running mypapers you should properly name each one of your papers and specify the hierarchy of your categories in the file *structure.txt*.

### Paper Naming

You should name a paper as follows:
```
<key>-<papertitle><.tag>*.pdf
```
For example consider the following paper:

*Erman Pattuk, Murat Kantarcioglu, Zhiqiang Lin, Huseyin Ulusoy, Preventing Cryptographic Key Leakage in Cloud Virtual Machines. Proceedings of the 23rd USENIX Security Symposium. 2014*

Lets assume that the above paper falls under these categories: *Cloud, Security, Virtualization*. Then, the name of the paper should be:

*Pattuk2014-Preventing Cryptographic Key Leakage in Cloud Virtual Machines.Cloud.Security.Virtualization.pdf*

Note, that you can use your desired form for the **key** field, but it should not contain any white spaces. In addition, the **category tags** should not contain white spaces.

### Categories Structure

You can specify the hierarchy of your desired categories in the file *structure.txt*. The content of this file should follow the form below. Note that **each category term should not contain white characters**. Category terms are separated from each other with spaces or tabs:

> **File: structure.txt**
>
>CategoryA 
>CategoryA CategoryA1
>CategoryA CategoryA1 CategoryA11
>...
>CategoryA CategoryAn
>...
>CategoryB
>CategoryB CategoryB1
>...

The structure file will guide mypapers to generate the following directory hierarchy under *CATEGORIESDIR*:
```
CATEGORIESDIR
+-- CategoryA
|   +-- CategoryA1
|      +-- CategoryA11
| ...
|   +-- CategoryAn
+-- CategoryB
|   +-- CategoryB1
| ...
```

### Notes

You can also have notes for each one of your papers. To accomplish this, create a text file under the *NOTESDIR* directory and name it with the **key** field of the corresponding paper.

### Bibliographic Data

You can store bibliographic data in *bibtex* form for your papers in the file *bibliography.bib* under the *BIBDIR* directory. Each bibtex entry should contain a **key** that matches the **key** field of the corresponding paper.

### Running mypapers
You can run the tool as follows:

```
$ python TOPDIR/mypapers/mypapers.py <parameters>   
```

The tool accepts the following parameters:

- -h, --help: Prints usage information.
- -u, --update [categories|links|pages|all]: Updates the directory structure, the symbolic links, or the html pages.

Each time that you update the categories hierarchy, you should run mypapers with the *-u categories* option to update the categories directory tree. Additionally, when you add new papers to the ALLDIR directory, you should run mypapers with the parameter *-u links* and *-u pages* to update paper links and the index page. You can also run mypapers with the *-u all* parameter to update the categories, the links, and the index page at once.

Development and Contributing
----------------------------
The initial developer of Skytale is [Giorgos Kappes](http://giorgoskappes.com). Feel free to contribute to the development of mypapers by cloning the repository: 

`git clone https://github.com/geokapp/mypapers`

You can also send feedback, new feature requests, and bug reports to <geokapp@gmail.com>.
