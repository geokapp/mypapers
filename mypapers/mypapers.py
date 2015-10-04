#
# mypapers - A simple tool to manage and organize papers.
#
# Copywrite (C) 2015 Giorgos Kappes <geokapp@gmail.com>
#
# This is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License version 2.1, as published by the Free Software
# Foundation.  See file COPYING.
#

import ConfigParser, getopt, os, re, sys
from pybtex.database.input import bibtex

def usage():
    """ Prints usage information to the screen.
    """

    print 'Usage: ' + sys.argv[0] + ' <options>\n'
    print 'Supported options:'
    print '-h, --help:'
    print '    Prints usage information.'
    print '-u, --update <categories|links|pages|all>:'
    print '    Updates the directory structure, the symbolic links, or the html pages.'

def remove_broken_links(configuration):
    """ Removes broken links to paper pdfs.

    Args:
       configuration (dict): Contains the configuration parameters.
    """
    for root, dirs, files in os.walk(configuration['categoriesdir']):
        for file in files:
            filepath = os.path.join(root,file)
            if os.path.islink(filepath):
                targetpath = os.readlink(filepath)
                if not os.path.isabs(targetpath):
                    targetpath = os.path.join(os.path.dirname(filepath), targetpath)
                if not os.path.exists(targetpath):
                    print 'Info: Removed broken link ' + targetpath + '.'
                    os.remove(filepath)
            else:
                continue  
    
def update_categories(configuration):
    """ Updates the category tree by creating the necessary directories.
    
    Args:
        configuration (dict): Contains the configuration parameters.
    
    Return:
        0: Update of categories was successful.
        1: Update of categories was not successful.
    """
    
    print 'Info: Updating categories...'

    # Clear existing categories first.
    for root, dirs, files in os.walk(configuration['categoriesdir'], topdown = False):
        for name in files:
            os.remove(os.path.join(root, name))
        for name in dirs:
            os.rmdir(os.path.join(root, name))
    
    # Create the new category tree.
    try:
        fd = open(configuration['structuredir']+'/structure.txt')
    except:
        print 'Error: Cannot open ' + configuration['structuredir']+'/structure.txt structure file.'
        return 1
    for line in fd:
        line = re.sub(r"\s+", '/', line)
        try:
            os.makedirs(configuration['categoriesdir'] + '/' + line)
        except:
            continue        
    fd.close()
    print 'Info: Categories updated.'
    return 0

def update_links(configuration):
    """ For each paper under the ALLDIR directory it generates the necessary links 
        to each category directory according to the user specified tags.
    
    Args:
        configuration (dict): Contains the configuration parameters.
    
    Return:
        0: Update of links was successful.
        1: Update of links was not successful.
    """

    print 'Info: Updating links...'
    try:
        fd = open(configuration['structuredir'] + '/structure.txt')
    except:
        print 'Error: Cannot open the structure file.'
        return 1
    
    # Build a dictionary that contains mappings from tags to paths.
    tag_map = {}
    for line in fd:
        line = re.sub(r"\s+", '/', line)
        line_without = line[0:len(line) - 1]
        tag = line_without[line_without.rfind('/') + 1:]
        tag_map[tag] = line
    fd.close()

    # Process all the available papers. For each paper, extract its tags and
    # create symbolic links under the appropriate directories.
    for root, dirs, files in os.walk(configuration['alldir']):
        for file in files:
            filepath = os.path.join(root,file)
            
            # Remove any newlines and tabs from file names.
            newfilepath = filepath.replace('\n', ' ')
            newfilepath = newfilepath.replace('\t', ' ')
            if (filepath != newfilepath):
                os.rename(filepath, newfilepath)
            filepath = newfilepath

            # Extract all the tags: tag1.tag2....tagn
            tags = file[file.find('.') + 1:file.rfind('.')]

            # If no tags are found skip this file.
            if len(tags) <= 1:
                print 'Warning: ' + filepath + ': no tags are specified.'
                continue

            targetfile=file[:file.find('.')] + file[file.rfind('.'):]
            tag_list = tags.split(".")
            for i in tag_list:
                
                # Find the target path from the tag map and create the symlink.
                try:
                    targetpath = tag_map[i]
                except:
                    print 'Warning: ' + filepath + ': Tag: ' + i + ' does not exist in structure file.'
                    continue;
                try:
                    os.symlink(filepath, configuration['categoriesdir'] + '/' + targetpath + targetfile)
                except:
                    continue;

    # Remove any broken links.
    remove_broken_links(configuration)
    print 'Info: Links updated.'
    return 0

def update_pages(configuration):
    """ It generates an html page that contains a list of all the papers organized under 
        the user specified tags.

    Args:
        configuration (dict): Contains the configuration parameters.
    
    Return:
        0: Update of html page was successful.
        1: Update of html page was not successful.
    """

    print 'Info: Updating pages...'

    # Open bibtex file.
    bibparser = bibtex.Parser()
    try:
        bibdata = bibparser.parse_file(configuration['bibdir'] + '/bibliography.bib')
    except:
        print 'Error: Cannot open ' + configuration['bibdir'] +'/bibliography.bib file.'
        return 1;
    
    # Copy header.
    try:
        fdout = open(configuration['topdir'] + '/index.html', 'w')
    except:
        print 'Error: Cannot open ' + configuration['topdir'] +'/index.html file.'
        return 1
    try:
        fdheader  = open(configuration['topdir'] + '/mypapers/Template/header.html')
    except:
        print 'Error: Cannot open ' + configuration['topdir'] + '/mypapers/Template/header.html'
        fdout.close()
        return 1
    for line in fdheader:
        fdout.write(line)
    fdheader.close()

    # First pass: Create the nav bar.
    top = configuration['categoriesdir']
    while top.endswith('/'):
        top = top[:-1]

    top_count = top.count('/')
    for root, dirs, files in os.walk(configuration['categoriesdir']):
        if root.count('/') == top_count + 1:
            category = root[root.rfind('/') + 1:]

            # Skip the Categories directory.
            if category == 'Categories' or category == '':
                continue
                                     
            # Top-level category. We should insert it to the nav bar.
            fdout.write('<li><a href="#' + category + '" class="smoothScroll">' + category + '</a></li>\n')
    try:
        fdnav  = open(configuration['topdir'] + '/mypapers/Template/nav.html')
    except:
        print 'Error: Cannot open ' + configuration['topdir'] + '/mypapers/Template/nav.html'
        fdout.close()
        return 1

    for line in fdnav:
        fdout.write(line)
    fdnav.close()

    # Second pass: Populate the content.
    first = True
    oldroot = ""
    for root, dirs, files in os.walk(top):
        if oldroot != "" and root.find(oldroot):
            
            # Close previous top-level category.
            try:
                fdafter  = open(configuration['topdir'] + '/mypapers/Template/after.html')
            except:
                print 'Error: Cannot open ' + configuration['topdir'] + '/mypapers/Template/after.html'
                fdout.close()
                return 1
            for line in fdafter:
                fdout.write(line)
            fdafter.close()
            
        category = root[root.rfind('/') + 1:]
        if category == 'Categories' or category == '':
            continue
        if root.count('/') == top_count + 1:
            if first:
                fdout.write('<div class="section_first"> <a class="anchor" id="' + category + '"></a>\n')
                first = False
            else:
                fdout.write('<div class="section"> <a class="anchor" id="' + category + '"></a>\n')
            fdcontent  = open(configuration['topdir'] + '/mypapers/Template/content.html')
            for line in fdcontent:
                fdout.write(line)
            fdcontent.close()
            fdout.write('<h3> ' + category + '</h3>\n')    
        else:
            fdout.write('<h4> ' + category + '</h4>\n')

        # Now process the files.
        fdout.write('<ul class="small_text"><li style="list-style-type: none;"></li>\n')
        for file in files:
            filepath = os.path.join(root,file)
            key = file[:file.find('-')]
            file = file[file.find('-') + 1:file.find('.')]
            fdout.write('<li><b>' + file + '</b> (<a href="' + filepath+'">Paper</a>,<a href="' +
                        configuration['notesdir'] + '/' + key + '.txt"> Notes</a>).<br />\n')

            # Extract bibliographyc info.
            try:
                b = bibdata.entries[key].fields
                try:
                                     
                    # Deal with multiple authors.
                    fdout.write('<i><b>Authors:</b> ')
                    for author in bibdata.entries[key].persons["author"]:
                        fdout.write(''.join(author.first()) + '  ' + ''.join(author.last()) + ', ')
                    fdout.write('</i><br />\n')
                    try:
                        fdout.write('<i><b>Journal:</b> ' + b["journal"] + '</i><br />\n')
                    except:
                        pass
                    try:
                        fdout.write('<i><b>Volume:</b> ' + b["volume"] + '</i><br />\n')
                    except:
                        pass
                    try:
                        fdout.write('<i><b>Number:</b> ' + b["number"] + '</i><br />\n')
                    except:
                        pass
                    try:
                        fdout.write('<i><b>Proceedings:</b> ' + b["booktitle"] + '</i><br />\n')
                    except:
                        pass
                    try:
                        fdout.write('<i><b>Address:</b> ' + b["address"] + '</i><br />\n')
                    except:
                        pass
                    try:
                        fdout.write('<i><b>Month:</b> ' +  b["month"]+ '</i><br />\n')
                    except:
                        pass
                    try:
                        fdout.write('<i><b>Year:</b> ' +  b["year"]+ '</i><br />\n')
                    except:
                        pass
                except(KeyError):
                    pass
            except(KeyError):
                print 'Warning: No bibliographic entry for ' + key + '.'

            fdout.write('</li>\n')
        fdout.write('</ul>\n')
        if root.count('/') == top_count + 1:
            oldroot = root
    
    # Close last top-level category.
    try:
        fdafter  = open(configuration['topdir'] + '/mypapers/Template/after.html')
    except:
        print 'Error: Cannot open ' + configuration['topdir'] + '/mypapers/Template/after.html'
        fdout.close()
        return 1
    for line in fdafter:
        fdout.write(line)
    fdafter.close()

    # Write the page footer.
    try:
        fdfooter  = open(configuration['topdir']+'/mypapers/Template/footer.html')
    except:
        print 'Error: Cannot open ' + configuration['topdir'] + '/mypapers/Template/footer.html'
        fdout.close()
        return 1
    for line in fdfooter:
        fdout.write(line)
    fdfooter.close()
    fdout.close()
    print 'Info: Pages updated.'
    return 0        
                        
def parse_parameters(options):
    """ Parses the user specified parameters.
    
    Args: 
        options (dict): A dictionary that will hold the user specified options.
    
    Return:
        0: Success, 
        1: Help note requested, 
        2: Error.
    """

    try:
        opts, args = getopt.getopt(sys.argv[1:], 'hcu:', ['help', 'configuration=', 'update='])
    except getopt.GetoptError:
        usage()
        return 2
    for o, a in opts:
        if o in ('-h', '--help'):
            usage()
            return 1
        elif o in ('-c', '--configuration'):
            if (not os.path.exists(a)):
                print('Error: Configuration file ' + a + ' does not exist')
                return 2
            else:
                options['configuration_file'] = a
        elif o in ('-u', '--update'):
            if (a != 'links' and a != 'categories' and a != 'pages' and a != 'all'):
                print('Error: invalid parameter: ' + a)
                usage()
                return 2
            elif (a == 'links'):
                options['update_links_flag'] = True;
            elif (a == 'pages'):
                options['update_pages_flag'] = True;
            elif (a == 'categories'):
                options['update_categories_flag'] = True;
            else:
                options['update_all_flag'] = True;
        else:
            print('Error: Invalid option: ' + a)
            usage()
            return 2
    return 0
    
def parse_configuration(options, configuration):
    """ Parses the configuration file.
    
    Args:
        options (dict): A dictionary that contains the user specified arguments.
        configuration (dict): A dictionary that will be filled with the configuration
                              options from the configuration file.
    
    Return:
        0: Parsing of the configuration file was successful.
        1: Parsing of the configuration file failed.
    """
    
    if not os.path.exists(options['configuration_file']):
        return 1

    config = ConfigParser.ConfigParser()
    config.read(options['configuration_file'])
    for section in config.sections():
        for current in config.options(section):
            try:
                configuration[current] = config.get(section, current)
            except:
                print('Error: Exception on' + current)
    
    return 0

def check_structure(configuration):
    """ Checks the directory structure.
    
    Args:
        configuration (dict): Contains the configuration parameters extracted from the 
                              configuration file.
    
    Return:
        0: The directory structure is valid.
        1: The directory structure is not valid.
    """
    
    for dir in (configuration['alldir'], configuration['categoriesdir'],
                configuration['structuredir'], configuration['notesdir'],
                configuration['bibdir'], configuration['topdir'] + '/mypapers'):
        if not os.path.exists(dir):
            print 'Error: ' + dir + ' is missing!' 
            return 1
    return 0

def main():
    # Initialize options dictionary.
    options = {}
    options['update_pages_flag'] = False
    options['update_all_flag'] = False
    options['update_links_flag'] = False
    options['update_notes_flag'] = False
    options['update_categories_flag'] = False
    options['configuration_file'] = os.path.expanduser("~") + '/.mypapers/mypapers.ini'

    # Parse user specified parameters.
    result = parse_parameters(options)
    if (result):
        sys.exit(result)

    # Read the configuration file.
    configuration = {}
    result = parse_configuration(options, configuration)
    if (result):
        print  'Error: Configuration file ' + options['configuration_file'] + ' does not exist.\n'
        sys.exit(result)

    # Check the directory structure.
    result = check_structure(configuration)
    if (result):
        sys.exit(result)

    # Check options.
    if options['update_categories_flag']:
        result = update_categories(configuration)

    if options['update_links_flag']:
        result = update_links(configuration)

    if options['update_pages_flag']:
        result = update_pages(configuration)

    if options['update_all_flag']:
        result = update_categories(configuration)
        if (result):
            sys.exit(result)        
        result = update_links(configuration)
        if (result):
            sys.exit(result)
        result = update_pages(configuration)
        if (result):
            sys.exit(result)

    sys.exit(result)
    
if __name__ == "__main__":
    main()
