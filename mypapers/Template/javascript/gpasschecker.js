/***************************************************************************
 * filename:      gpasscheker.js                                           *
 * Created by:    Giorgos kappes      	                                   *
 * email:         geokapp@gmail.com                                        *
 * First Version: 12-03-2005                                               *
 * Last Revision: 10-05-2010                                               *
 * Version:       1.0                                                      *
 ***************************************************************************
 *  Copyright (C) 2010 Giorgos Kappes                                      *
 *  This file is part of passGen.                                          *
 *                                                                         *
 *  gpasschecker is free software: you can redistribute it and/or modify   *
 *  it under the terms of the GNU General Public License as published by   *
 *  the Free Software Foundation, either version 3 of the License, or      *
 *  (at your option) any later version.                                    *
 *                                                                         *
 *  gpasschecker is distributed in the hope that it will be useful,        *
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of         *
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the          *
 *  GNU General Public License for more details.                           *
 *                                                                         *
 *  You should have received a copy of the GNU General Public License      *
 *  along with gpasschecker.  If not, see <http://www.gnu.org/licenses/>.  *
 ***************************************************************************/

/***************************************************************************
 * Global Variables														   *
 ***************************************************************************/
  
var numbers 	= "0123456789"; 					// Numbers set
var lowercase 	= "abcdefghijklmnopqrstuvwxyz"; 	// lower-case letter set
var uppercase 	= "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; 	// upper-case letter set
var special 	= "!#%&$()*+,-./~:;<=>?@[\\]^_`{|}"; // special characters
var usual		= "aeiorsAEIORS1@$!";				// most usual characters

/***************************************************************************
 * function: checkPassword(password)									   *
 * arguments: > password (the password string)							   *
 ***************************************************************************/
 
function checkPassword(password) { 

    /* variable declaration ************************************************/
    var score;	  // variable to keep the score of the password
    var len;	  // variable to keep the password length
    var pairs;	  // variable to keep the number of character pairs found
    var desc;	  // variable to keep the score deduction because of pairs
    var consec;	  // number of consecutive characters contained in the password
    var usualNum; // number of usual characters contained in the password
    var usualDed; // deduction of score because of usual characters contained
    
     
 	/* get password length */
 	score 		= 0.0;
	len 		= getPasswordLength(password);

	/* calculate length points */
	score 		+= calculateLengthPoints(len);

	/* calculate char usage points */
	score 		+= calculateStringPoints(password, len);

	/* calculate set usage points */
	score 		+= calculateSetPoints(password, len);

	/* find repeat pairs */
	pairs 		= checkRepeatPairs(password);

	/* calculate consecutive chars deductiion */
	consec	 	= checkConsecutiveChars(password); 
	score 		+= consec; 

	/* calculate usual character deduction */
	usualNum 	= contains(password, usual);
	if (usualNum >= 3)
		usualDed 	= (usualNum-2)*usualNum * (-1);
	else 
		usualDed 	= 0;		
	score 		+= usualDed;

	/* calculate repeatition points */
	desc 		= calculateRepeatCharPoints(pairs);
	score 		+= desc;
	
	/* write results */
	printResults(score, pairs, desc, len, usualNum, usualDed, consec);
	
	return; 
 
} 
/***************************************************************************
 * function: printResults(score, pairs, desc, len, usualDed)			   *
 * arguments: 	> score 	(the password total score)					   *
 *				> pairs 	(the number of pairs found in the password 	   *
 *				> desc 		(the point deduction because of pairs)		   *
 *				> len 		(the length of the password					   *
 *				> usualNum 	(the number of usual characters in the passw)  *
 *				> usualDed 	(the deduction because of usual characters)	   *
 *				> consec	(the deduction 'cause of conecutive characters)*
 ***************************************************************************/
function printResults(score, pairs, desc, len, usualNum, usualDed, consec) {

	/* Get html objects by ids */
    var progressBar 		= document.getElementById("progressBar"); 
    var progressPercent 	= document.getElementById("progressPercent");
    var complexDiv 			= document.getElementById("complex");
    var lengthDescField 	= document.getElementById("lengthDescField");
    var lengthRatField 		= document.getElementById("lengthRatField");
    var pairsDescField 		= document.getElementById("pairsDescField");
    var pairsRatField 		= document.getElementById("pairsRatField"); 
    var consDescField 		= document.getElementById("consDescField");
    var consRatField 		= document.getElementById("consRatField"); 
    var usuDescField 		= document.getElementById("usuDescField");
    var usuRatField 		= document.getElementById("usuRatField");    
        	
	/* fix score */
	score = Math.round(score*10)/10 // round score to one decimal
	if (score > 100) score = 100;	// fix upper limit
	if (score < 0) score = 0;   	// fix lower limit
    
	/* Score explanation */
	
	/* pairs description */
    pairsDescField.innerHTML  = "Your password contains " + pairs + " same character pairs. Score Reduction: " + Math.round(desc*10)/10;
    if (pairs > 1) {	
    	pairsRatField.innerHTML  = "<img src=\"images/no.png\" />";
    }
    else {
    	pairsRatField.innerHTML  = "<img src=\"images/ok.png\" />";
    }    
    
    /* length description */
    lengthDescField.innerHTML  = "Your password contains: " + len + " characters";
    if ( len >= 8)
    	lengthRatField.innerHTML  = "<img src=\"images/ok.png\" />";
    else
    	lengthRatField.innerHTML  = "<img src=\"images/no.png\" />";

    /* consecutive character description */
    consDescField.innerHTML  = "Score reduction due to consecutive characters: " + Math.round(consec*10)/10;
    if (consec < 0)
    	consRatField.innerHTML  = "<img src=\"images/no.png\" />";
    else
    	consRatField.innerHTML  = "<img src=\"images/ok.png\" />";

    /* usual character description */
    usuDescField.innerHTML  = "Your password contains: " + usualNum + " usual characters. Score Reduction: " + Math.round(usualDed*10)/10;;
    if ( usualNum < 3)
    	usuRatField.innerHTML  = "<img src=\"images/ok.png\" />";
    else
    	usuRatField.innerHTML  = "<img src=\"images/no.png\" />";
    	
    /* write score */
    progressBar.style.width = score + "%"; 		// progress bar width
    progressPercent.innerHTML  = score + " %";  // progress bar text  	
    if (score > 90) { 
        // strong password 
        progressBar.style.backgroundColor = "#3bce08"; 
        complexDiv.innerHTML  = " Strong ";
        return; 
    } 
 
    else if (score > 75) { 
        // good password 
        progressBar.style.backgroundColor = "#33CCCC"; 
        complexDiv.innerHTML  = " Good ";
        return; 
    } 
 
    else if (score > 50) { 
        // fair password 
        progressBar.style.backgroundColor = "#CCFF00"; 
        complexDiv.innerHTML  = " Fair ";
        return; 
    } 
    else if (score > 25) { 
        // weak password 
        progressBar.style.backgroundColor = "#FF6600"; 
        complexDiv.innerHTML  = " Weak ";
        return; 
    } 
    else { 
        // very weak password 
        progressBar.style.backgroundColor = "#FF0000"; 
        complexDiv.innerHTML  = " Very Weak ";
        return; 
    }
}
 
/***************************************************************************
 * function: contains(password, validChars)								   *
 * arguments: > password (the password string)							   *
 *			  > validChars (a valid character set)						   *
 ***************************************************************************/ 
function contains(password, validChars) { 
 
    var count;		// character counter
    var i;			
    var chara;		// temp character
    
    count = 0; 
 
    for (i = 0; i < password.length; i++) { 
        chara = password.charAt(i); 
        if (validChars.indexOf(chara) > -1) { 
            count++; 
        } 
    } 
    return count; 
} 
/***************************************************************************
 * function: checkConsecutiveChars(password)							   *
 * arguments: > password (the password string)							   *
 ***************************************************************************/ 
function checkConsecutiveChars(password) {

	var count;	// number of consecutive chars found
	var tempSet;	// temporary set
	var chara; 	// temporary character
	var charb;	// temporary character
	var i;
	var doit;
	var res;
	
	doit = 1;
	count = 0;
	for (i = 1; i < password.length; i++) {
		chara = password.charAt(i-1);	// i-1th character
		charb = password.charAt(i);		// ith character
		if (doit == 1) {
		
			/* find the set of i-1 character */
			if (numbers.indexOf(chara) > -1) 
				tempSet = numbers;
			else if (lowercase.indexOf(chara) > -1)
				tempSet = lowercase;
			else if (uppercase.indexOf(chara) > -1)
				tempSet = uppercase;
			else 
				tempSet = special;
		}
		/* check if the ith character is in the same set */
		if (tempSet.indexOf(charb) > -1) {
			doit = 1;
			if (tempSet == special)
				count += 0.3;
			else 
				count++;
		} else {
			doit = 1;
		}
	}
	res = 4*count * (-1);
	return res;
}
	
/***************************************************************************
 * function: checkRepeatPairs(password)	    							   *
 * arguments: > password (the password string)							   *
 ***************************************************************************/ 
function checkRepeatPairs(password) { 
 
    var count = 0; 
 	var i;
    for (i = 1; i < password.length; i++) { 
        var charb = password.charAt(i); 
        var chara = password.charAt(i-1);
        if (charb == chara) {
        	count++;
        }
	}
	return count;

}

/***************************************************************************
 * function: calculateRepeatCharPoints(count)  							   *
 * arguments: > count (the same characterpairs found in password)		   *
 ***************************************************************************/ 
function calculateRepeatCharPoints(count) {
	var res = 	Math.pow(count,3) * (-1);
	return res;
}

/***************************************************************************
 * function: getPasswordLength(password)	   							   *
 * arguments: > password (the password string)							   *
 ***************************************************************************/
function getPasswordLength(password) {

	var len = password.length;
	return(len);
}

/***************************************************************************
 * function: calculateLengthPoints(len)		   							   *
 * arguments: > len (the password length)								   *
 ***************************************************************************/
function calculateLengthPoints(len) {

	if (len < 8) return 0;
	else if (len == 8) return 21;
	else if (len <= 12) return (20 + (len - 8)*2.5);
	else if (len <= 20) return (30 + (len - 12)*1.5);
	else return 43;
}

/***************************************************************************
 * function: calculateStringPoints(password,len)  						   *
 * arguments: > password	(the password string)						   *
 *			  > len 		(the password length)						   *						
 ***************************************************************************/
function calculateStringPoints(password, len) {
	var nA;
	var nB;
	var nC;
	var nD;
	var score;
	/* find the number of characters of each set that the password contains */
	nA = contains(password, numbers); 
	nB = contains(password, uppercase);
	nC = contains(password, lowercase);
	nD = contains(password, special);
	score = nA * 3 + nD * 5;
	if (nB > 0) score += len / nB * 3;
	if (nC > 0) score += len / nC * 3;
	return score;
}

/***************************************************************************
 * function: calculateSetPoints(password)   							   *
 * arguments: > password (the password string)							   *
 ***************************************************************************/
function calculateSetPoints(password, len) {
 	 
	var nA = contains(password, uppercase);
	var nB = contains(password, lowercase);
	var nC = contains(password, numbers);
	var nD = contains(password, special); 
	
    var setDescField = document.getElementById("setDescField");
    var setRatField = document.getElementById("setRatField");
    	
	/* contains all the four sets */
	if (nA > 0 && nB > 0 && nC > 0 && nD > 0 && len > 7) {
		setDescField.innerHTML  = "Your password includes [a..z], [A..Z], [0..9], [!..}]. Bonus: +40";
		setRatField.innerHTML  = "<img src=\"images/ok.png\" />";
		return 40;
	}
	/* contains letters (lowrcase or uppercase), numbers and special characters */
	else if ((nA > 0 || nB > 0 ) && nC > 0 && nD > 0 && len > 7) {
		setDescField.innerHTML  = "Your password includes [a..z] / [A..Z], [0..9], [!..}]. Bonus: +30";
		setRatField.innerHTML  = "<img src=\"images/ok.png\" />";
		return 30;
	}
	/* contains numbers and special characters */
	else if (nC > 0 && nD > 0) {
		setDescField.innerHTML  = "Your password includes [0..9], [!..}]. No Bonus";
		setRatField.innerHTML  = "<img src=\"images/no.png\" />";
		return 0;
	} 
	/* contains letters (lowrcase and uppercase), and special characters */
	else if (nA > 0 && nB > 0 && nD > 0) {
		setDescField.innerHTML  = "Your password includes [a..z], [A..Z],[!..}]. No Bonus";
		setRatField.innerHTML  = "<img src=\"images/no.png\" />";
		return 0;
	}
	/* contains letters (lowrcase or uppercase), and special characters */
	else if ((nA > 0 || nB > 0) && nD > 0) {
		setDescField.innerHTML  = "Your password includes [a..z] / [A..Z], [!..}]. No Bonus";
		setRatField.innerHTML  = "<img src=\"images/no.png\" />";	
		return 0;
	}
	/* contains letters (lowrcase AND uppercase), and numbers */
	else if (nA > 0 && nB > 0 && nC > 0) {
		setDescField.innerHTML  = "Your password includes [a..z], [A..Z], [0..9]. No Bonus";
		setRatField.innerHTML  = "<img src=\"images/no.png\" />";	
		return 0;
	}	
	/* contains letters (lowrcase OR uppercase), and numbers */
	else if ((nA > 0 || nB > 0) && nC > 0) {
		setDescField.innerHTML  = "Your password includes [a..z] / [A..Z], [0..9]. No Bonus";
		setRatField.innerHTML  = "<img src=\"images/no.png\" />";	
		return 0;
	}
	/* contains letters (lowrcase AND uppercase) */
	else if (nA > 0 && nB > 0) {
		setDescField.innerHTML  = "Your password includes only [a..z], [A..Z]. No Bonus";
		setRatField.innerHTML  = "<img src=\"images/no.png\" />";		
		return 0;
	}
		
	/* contains letters (lowrcase or uppercase) */
	else if (nA > 0 || nB > 0) { 	
		if (nA > 0) {
			setDescField.innerHTML  = "Your password includes only [A..Z]. Reduction: " + Math.round((-120/nA)*10)/10 ;
			setRatField.innerHTML  = "<img src=\"images/no.png\" />";				
			return -120/nA;
		}
		else {
			setDescField.innerHTML  = "Your password includes only [a..z]. Reduction: " + Math.round((-120/nB)*10)/10 ;
			setRatField.innerHTML  = "<img src=\"images/no.png\" />";		
			return -120/nB;
		}
	}	
	/* contains only numbers */
	else if (nC > 0) {
		setDescField.innerHTML  = "Your password includes only [0..9]. Reduction: " + Math.round((-100/nC)*10)/10  ;
		setRatField.innerHTML  = "<img src=\"images/no.png\" />";			
		return -100/nC;	
	}
	/* contains only symbols */
	else if (nD > 0) {
		setDescField.innerHTML  = "Your password includes only [!..}]. Reduction: " + Math.round((-60/nD)*10)/10  ;
		setRatField.innerHTML  = "<img src=\"images/no.png\" />";			
		return -60/nD;	
	}
	else {
		setDescField.innerHTML  = "You have not type a password yet.";
		setRatField.innerHTML  = "<img src=\"images/no.png\" />";	
	}
	return 0;

	
}		

/***************************************************************************
 * function: togPwdMask()   											   *
 * arguments: -															   *
 ***************************************************************************/
function togPwdMask() {
	var passField = document.getElementById("passwordTxt"); 	
	var chkBox = document.getElementById("mask"); 
	if (chkBox.checked == false)
		passField.type="text";
	else
		passField.type="password";
}
