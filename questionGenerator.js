// questionGenerator.js

/**
 * Helper function to format an algebraic term (e.g., "5x", "-x", "3x<sup>3</sup>", "5").
 * Returns "" (empty string) if coefficient is 0.
 * Handles exponent = 0 correctly (returns formatted coefficient).
 */
function formatTerm(coefficient, variable, exponent = 1, includeSign = false) {
    if (coefficient === 0) return "";
    // Handle exponent 0
    if (exponent === 0) {
        return formatConstant(coefficient, includeSign);
    }
    let termPrefix = '';
    if (includeSign) {
        termPrefix = coefficient > 0 ? ' + ' : ' - ';
    } else {
        termPrefix = coefficient < 0 ? '-' : '';
    }
    let absCoeff = Math.abs(coefficient);
    // Show coefficient '1' only if it's a constant term (variable is '', exp is 1)
    let coeffStr = (absCoeff === 1 && variable !== '') ? '' : absCoeff.toString();

    let expStr = '';
    if (exponent === 1 || variable === '') {
        expStr = '';
    } else if (exponent < 0) {
         // Display negative exponents directly (e.g., <sup>-2</sup>)
         expStr = `<sup>${exponent}</sup>`;
    } else {
         expStr = `<sup>${exponent}</sup>`;
    }

    // Avoid showing exponent if variable is missing
    if (variable === '' && exponent !== 1) {
         // This case might not be fully needed if we always use formatConstant for pure numbers
         return `${termPrefix}${Math.pow(absCoeff, exponent)}`;
    }

    // Ensure "x" is shown for "1x" or "-1x" even with exponents
    if (absCoeff === 1 && variable !== '' && coeffStr === '') coeffStr = '';

    let formattedTerm = `${termPrefix}${coeffStr}${variable}${expStr}`;
    return formattedTerm;
}

/** Helper function to format a constant term */
function formatConstant(value, includeSign = false) {
    if (value === 0) return "";
    if (includeSign) {
        return value > 0 ? ` + ${value}` : ` - ${Math.abs(value)}`;
    }
    return value < 0 ? `-${Math.abs(value)}` : value.toString();
}

/** Helper function to format a fraction */
function formatFractionHTML(numeratorHTML, denominatorHTML) {
    const num = numeratorHTML === "" ? "0" : numeratorHTML;
    const den = denominatorHTML === "" ? "1" : denominatorHTML;
    // Basic fraction for now, styling in CSS
    return `<div class="fraction"><span class="numerator">${num}</span><span class="denominator">${den}</span></div>`;
}


// --- DISTRACTOR FUNCTIONS ---

/** Distractor generator for SIMPLE answers */
function generateDistractors_Simple(correctAnswerTerm, correctNumericValue, variable, minCoeff, maxCoeff) {
    let d=new Set(); d.add(correctAnswerTerm);
    d.add(formatTerm(correctNumericValue+1,variable,1)); d.add(formatTerm(correctNumericValue-1,variable,1)); d.add(`${correctNumericValue}`);
    if(correctAnswerTerm!=="0"){d.add(formatTerm(correctNumericValue,variable,2)); d.add(formatTerm(-correctNumericValue,variable,1));}else{d.add(formatTerm(1,variable,1)); d.add(formatTerm(-1,variable,1));}
    let fO=Array.from(d).filter(opt=>opt!==''); fO=Array.from(new Set(fO));
    while(fO.length<4){ let rC=Math.floor(Math.random()*(maxCoeff*2+1))-maxCoeff; if(rC===0&&correctAnswerTerm!=="0")rC=1; let rO=formatTerm(rC,variable,1); if(rO&&!fO.includes(rO)){fO.push(rO);}else{rO=`${rC}`; if(rO!=="0"&&!fO.includes(rO))fO.push(rO);} }
    while(fO.length>4){ const i=Math.floor(Math.random()*fO.length); if(fO[i]!==correctAnswerTerm){fO.splice(i,1);} } return fO.sort(()=>Math.random()-0.5);
}
/** Distractor generator for COMPOUND answers */
function generateDistractors_Compound(correctResult, variable) {
    const {xCoeff, constant}=correctResult;
    let cA='';
    if(xCoeff!==0) cA=formatTerm(xCoeff,variable,1);
    if(constant!==0) cA+=formatConstant(constant, xCoeff!==0);
    if(cA==="") cA="0";

    let d=new Set();
    d.add(cA);

    // --- NEW LOGIC ---
    // Check if the correct answer is just a constant
    if (xCoeff === 0) {
        // Correct answer is just a number (e.g., "3")
        // We will add distractors that are clearly different.
        d.add(formatConstant(constant + 1, false)); // "4"
        d.add(formatConstant(constant - 1, false)); // "2"
        d.add(formatTerm(1, variable, 1)); // "x"
        if(constant !== 0) d.add(formatTerm(constant, variable, 1)); // "3x"
        d.add(formatTerm(1, variable, 1) + formatConstant(constant, true)); // "x + 3"
    } else {
        // This is the original logic (for answers like "2x + 3")
        d.add(`${formatTerm(xCoeff+1,variable,1)}${formatConstant(constant,true)}`);
        d.add(`${formatTerm(xCoeff,variable,1)}${formatConstant(constant-1,true)}`);
        d.add(formatTerm(xCoeff+constant,variable,1));
        d.add(formatConstant(xCoeff+constant,false));
        d.add(`${formatTerm(xCoeff,variable,2)}${formatConstant(constant,true)}`);
    }
    // --- END NEW LOGIC ---

    let fO=Array.from(d).filter(opt=>opt!==''&&opt!==null);
    fO=Array.from(new Set(fO));

    // Fill-in logic
    while(fO.length<4){
        let rX = xCoeff+(Math.floor(Math.random()*3)-1);
        let rC = constant+(Math.floor(Math.random()*3)-1);
        
        // If correct answer was just a constant, ensure fill-in distractors are not just +/- variations
        if (xCoeff === 0 && rX === 0) {
             if (rC === constant) rC++; // ensure it's not the correct answer
             let rO = formatConstant(rC, false); // "4", "2", etc.
             if(rO==="")rO="0";
             if(rO && rO !== cA && !fO.includes(rO)) fO.push(rO);
             continue; // go to next loop iteration
        }
        
        let rO=`${formatTerm(rX,variable,1)}${formatConstant(rC,rX!==0)}`;
        if(rO==="")rO="x+y"; // arbitrary fallback
        if(rO&&!fO.includes(rO))fO.push(rO);
    }
    
    // Trim logic
    while(fO.length>4){
        const i=Math.floor(Math.random()*fO.length);
        if(fO[i]!==cA)fO.splice(i,1);
    }
    // Fallback fill
    while(fO.length<4)fO.push(`${fO.length}x+${fO.length}`); 
    return fO.sort(()=>Math.random()-0.5);
}
/** Distractor generator for MULTI VARIABLE answers */
function generateDistractors_MultiVariable(correctResult, var1, var2) {
    const {xCoeff, yCoeff}=correctResult; let cA=''; if(xCoeff!==0)cA=formatTerm(xCoeff,var1,1); if(yCoeff!==0)cA+=formatTerm(yCoeff,var2,1,xCoeff!==0); if(cA==="")cA="0";
    let d=new Set(); d.add(cA); d.add(`${formatTerm(xCoeff+1,var1,1)}${formatTerm(yCoeff,var2,1,true)}`); d.add(`${formatTerm(xCoeff,var1,1)}${formatTerm(yCoeff-1,var2,1,true)}`); d.add(formatTerm(xCoeff+yCoeff,`${var1}${var2}`,1)); d.add(formatTerm(xCoeff+yCoeff,var1,1)); d.add(`${formatTerm(xCoeff,var1,2)}${formatTerm(yCoeff,var2,1,true)}`);
    let fO=Array.from(d).filter(opt=>opt!==''&&opt!==null); fO=Array.from(new Set(fO));
    while(fO.length<4){ let rX=xCoeff+(Math.floor(Math.random()*3)-1); let rY=yCoeff+(Math.floor(Math.random()*3)-1); let rO=`${formatTerm(rX,var1,1)}${formatTerm(rY,var2,1,rX!==0)}`; if(rO==="")rO="x+y"; if(rO&&!fO.includes(rO))fO.push(rO); }
    while(fO.length>4){ const i=Math.floor(Math.random()*fO.length); if(fO[i]!==cA)fO.splice(i,1); } while(fO.length<4)fO.push(`${fO.length}x+${fO.length}y`); return fO.sort(()=>Math.random()-0.5);
}
/** Distractor generator for EXPONENT + CONSTANT answers */
function generateDistractors_ExponentWithConstant(correctResult, variable) {
    const {xCoeff, constant, xExp}=correctResult; let cA=''; if(xCoeff!==0)cA=formatTerm(xCoeff,variable,xExp); if(constant!==0)cA+=formatConstant(constant,xCoeff!==0); if(cA==="")cA="0";
    let d=new Set(); d.add(cA); d.add(`${formatTerm(xCoeff+1,variable,xExp)}${formatConstant(constant,true)}`); d.add(`${formatTerm(xCoeff,variable,xExp)}${formatConstant(constant-1,true)}`); d.add(`${formatTerm(xCoeff,variable,xExp+1)}${formatConstant(constant,true)}`); d.add(formatTerm(xCoeff+constant,variable,xExp));
    let fO=Array.from(d).filter(opt=>opt!==''&&opt!==null); fO=Array.from(new Set(fO));
    while(fO.length<4){ let rX=xCoeff+(Math.floor(Math.random()*3)-1); let rC=constant+(Math.floor(Math.random()*3)-1); let rO=`${formatTerm(rX,variable,xExp)}${formatConstant(rC,rX!==0)}`; if(rO==="")rO="x^2+1"; if(rO&&!fO.includes(rO))fO.push(rO); }
    while(fO.length>4){ const i=Math.floor(Math.random()*fO.length); if(fO[i]!==cA)fO.splice(i,1); } while(fO.length<4)fO.push(`${fO.length}x<sup>${xExp}</sup>+${fO.length}`); return fO.sort(()=>Math.random()-0.5);
}
/** Distractor generator for MULTIPLE EXPONENT TERMS answers */
function generateDistractors_ExponentMultiTerm(correctResult, variable) {
    const {term1Coeff, term2Coeff, term1Exp, term2Exp}=correctResult; let cA=''; if(term1Coeff!==0)cA=formatTerm(term1Coeff,variable,term1Exp); if(term2Coeff!==0)cA+=formatTerm(term2Coeff,variable,term2Exp,term1Coeff!==0); if(cA==="")cA="0";
    let d=new Set(); d.add(cA); d.add(formatTerm(term1Coeff+term2Coeff,variable,term1Exp)); d.add(formatTerm(term1Coeff+term2Coeff,variable,term1Exp+term2Exp)); d.add(`${formatTerm(term1Coeff+1,variable,term1Exp)}${formatTerm(term2Coeff,variable,term2Exp,true)}`); d.add(`${formatTerm(term1Coeff,variable,term1Exp+1)}${formatTerm(term2Coeff,variable,term2Exp,true)}`);
    let fO=Array.from(d).filter(opt=>opt!==''&&opt!==null); fO=Array.from(new Set(fO));
    while(fO.length<4){ let rC1=term1Coeff+(Math.floor(Math.random()*3)-1); let rC2=term2Coeff+(Math.floor(Math.random()*3)-1); let rO=`${formatTerm(rC1,variable,term1Exp)}${formatTerm(rC2,variable,term2Exp,rC1!==0)}`; if(rO==="")rO="x^2+x^3"; if(rO&&!fO.includes(rO))fO.push(rO); }
    while(fO.length>4){ const i=Math.floor(Math.random()*fO.length); if(fO[i]!==cA)fO.splice(i,1); } while(fO.length<4)fO.push(`${fO.length}x<sup>${term1Exp}</sup>+${fO.length}x<sup>${term2Exp}</sup>`); return fO.sort(()=>Math.random()-0.5);
}
/** Distractor generator for EXPONENT MULTI-VARIABLE answers */
function generateDistractors_ExponentMultiVariable(correctResult, var1, var2) {
    const {xCoeff, yCoeff, xExp, yExp}=correctResult; let cA=''; if(xCoeff!==0)cA=formatTerm(xCoeff,var1,xExp); if(yCoeff!==0)cA+=formatTerm(yCoeff,var2,yExp,xCoeff!==0); if(cA==="")cA="0";
    let d=new Set(); d.add(cA); d.add(`${formatTerm(xCoeff+1,var1,xExp)}${formatTerm(yCoeff,var2,yExp,true)}`); d.add(`${formatTerm(xCoeff,var1,xExp)}${formatTerm(yCoeff-1,var2,yExp,true)}`); d.add(`${formatTerm(xCoeff,var1,xExp+1)}${formatTerm(yCoeff,var2,yExp,true)}`); d.add(`${formatTerm(xCoeff,var1,xExp)}${formatTerm(yCoeff,var2,yExp+1,true)}`); d.add(formatTerm(xCoeff+yCoeff,var1,xExp));
    let fO=Array.from(d).filter(opt=>opt!==''&&opt!==null); fO=Array.from(new Set(fO));
    while(fO.length<4){ let rX=xCoeff+(Math.floor(Math.random()*3)-1); let rY=yCoeff+(Math.floor(Math.random()*3)-1); let rO=`${formatTerm(rX,var1,xExp)}${formatTerm(rY,var2,yExp,rX!==0)}`; if(rO==="")rO="x^2+y^2"; if(rO&&!fO.includes(rO))fO.push(rO); }
    while(fO.length>4){ const i=Math.floor(Math.random()*fO.length); if(fO[i]!==cA)fO.splice(i,1); } while(fO.length<4)fO.push(`${fO.length}x<sup>${xExp}</sup>+${fO.length}y<sup>${yExp}</sup>`); return fO.sort(()=>Math.random()-0.5);
}
/** Distractor generator for EXPONENT ON ONE VARIABLE answers */
function generateDistractors_ExponentSingleVariable(correctResult, var1, var2) {
    const {xCoeff, yCoeff, xExp}=correctResult; const yExp=1; let cA=''; if(xCoeff!==0)cA=formatTerm(xCoeff,var1,xExp); if(yCoeff!==0)cA+=formatTerm(yCoeff,var2,yExp,xCoeff!==0); if(cA==="")cA="0";
    let d=new Set(); d.add(cA); d.add(`${formatTerm(xCoeff+1,var1,xExp)}${formatTerm(yCoeff,var2,yExp,true)}`); d.add(`${formatTerm(xCoeff,var1,xExp)}${formatTerm(yCoeff-1,var2,yExp,true)}`); d.add(`${formatTerm(xCoeff,var1,xExp+1)}${formatTerm(yCoeff,var2,yExp,true)}`); d.add(`${formatTerm(xCoeff,var1,xExp)}${formatTerm(yCoeff,var2,xExp,true)}`); d.add(formatTerm(xCoeff+yCoeff,var1,xExp));
    let fO=Array.from(d).filter(opt=>opt!==''&&opt!==null); fO=Array.from(new Set(fO));
    while(fO.length<4){ let rX=xCoeff+(Math.floor(Math.random()*3)-1); let rY=yCoeff+(Math.floor(Math.random()*3)-1); let rO=`${formatTerm(rX,var1,xExp)}${formatTerm(rY,var2,yExp,rX!==0)}`; if(rO==="")rO="x^2+y"; if(rO&&!fO.includes(rO))fO.push(rO); }
    while(fO.length>4){ const i=Math.floor(Math.random()*fO.length); if(fO[i]!==cA)fO.splice(i,1); } while(fO.length<4)fO.push(`${fO.length}x<sup>${xExp}</sup>+${fO.length}y`); return fO.sort(()=>Math.random()-0.5);
}
/** Distractor generator for MULTIPLICATION answers */
function generateDistractors_Multiplication(correctResult, variable, difficultyLevel, n=1, m=1) {
    const {coeff, exp}=correctResult; let cA=formatTerm(coeff,variable,exp); if(cA==="")cA="0";
    let d=new Set(); d.add(cA); d.add(formatTerm(coeff,variable,exp+1)); if(exp>1){d.add(formatTerm(coeff,variable,exp-1));}else{d.add(formatTerm(coeff,variable,2));} d.add(formatTerm(coeff+1,variable,exp)); d.add(formatTerm(coeff-1,variable,exp)); if(coeff!==0){d.add(`${coeff}`);}
    const multipliedExp=n*m; if(multipliedExp!==exp&&(n>1||m>1)){d.add(formatTerm(coeff,variable,multipliedExp));}
    let fO=Array.from(d).filter(opt=>opt!==''&&opt!==null); fO=Array.from(new Set(fO));
    while(fO.length<4){ let rC=coeff+(Math.floor(Math.random()*5)-2); let rE=exp+(Math.floor(Math.random()*3)-1); if(rE<1)rE=1; let rO=formatTerm(rC,variable,rE); if(rO===""&&rC===0)rO=formatTerm(1,variable,rE||1); if(rO==="")rO="x"; if(rO&&!fO.includes(rO)){fO.push(rO);}else{rO=`${rC}`; if(rO!=="0"&&!fO.includes(rO))fO.push(rO);} }
    while(fO.length>4){ const i=Math.floor(Math.random()*fO.length); if(fO[i]!==cA)fO.splice(i,1); } while(fO.length<4)fO.push(`${fO.length}x<sup>${exp}</sup>`); return fO.sort(()=>Math.random()-0.5);
}
/**
 * Distractor generator for DIVISION answers
 * (UPDATED to remove fraction distractors from Level 29)
 */
function generateDistractors_Division(correctResult, variable, level) {
    const { coeff, exp } = correctResult; 
    let correctAnswer = ''; 
    let correctIsFraction = (level === 30 && exp < 0);
    
    // For Level 30, the correct answer IS a fraction.
    if (correctIsFraction) { 
        correctAnswer = formatFractionHTML(formatConstant(coeff), formatTerm(1, variable, -exp)); 
    } 
    // For all other levels (like 29), it's just a term.
    else { 
        correctAnswer = formatTerm(coeff, variable, exp); 
    } 
    
    if (correctAnswer === "") correctAnswer = "0";
    
    let d = new Set(); 
    d.add(correctAnswer);

    // This helper function correctly formats distractors based on the level.
    // It will *only* create fractions for Level 30.
    const formatDistractor = (dCoeff, dExp) => { 
        if (level === 30 && dExp < 0) { 
            if (dCoeff === 0) return "0"; 
            return formatFractionHTML(formatConstant(dCoeff), formatTerm(1, variable, -dExp)); 
        } else { 
            let term = formatTerm(dCoeff, variable, dExp); 
            return term === "" ? "0" : term; 
        } 
    };

    // Add standard distractors
    d.add(formatDistractor(coeff + 1, exp)); 
    d.add(formatDistractor(coeff - 1, exp)); 
    d.add(formatDistractor(coeff, exp + 1)); 
    if (exp !== 1) d.add(formatDistractor(coeff, exp - 1)); 
    d.add(formatDistractor(-coeff, exp));

    // --- REMOVED BLOCK ---
    // The following 'if' block was the problem. It has been removed.
    // if ((level === 28 || level === 29) && exp < 0) { 
    //     if(coeff !== 0) { 
    //         d.add(formatFractionHTML(formatConstant(coeff), formatTerm(1, variable, -exp))); 
    //     } 
    // }
    // --- END REMOVED BLOCK ---

    if (exp !== 0 && coeff !== 0) d.add(formatConstant(coeff));
    
    let fO = Array.from(d).filter(opt => opt !== '' && opt !== null); 
    fO = fO.filter(opt => opt !== "0" || correctAnswer === "0"); 
    fO = Array.from(new Set(fO));
    
    let maxTries = 10; 
    while (fO.length < 4 && maxTries > 0) { 
        let rC=coeff+(Math.floor(Math.random()*5)-2); 
        let rE=exp+(Math.floor(Math.random()*3)-1); 
        if(rE===0&&exp!==0)rE=exp>0?1:-1; 
        let rO=formatDistractor(rC,rE); 
        if(rO===""&&rC===0)rO="0"; 
        else if(rO==="")rO=formatTerm(1,variable,1); 
        if(rO&&rO!=="0"&&!fO.includes(rO)){fO.push(rO);} 
        maxTries--; 
    }
    
    while(fO.length>4){ 
        const i=Math.floor(Math.random()*fO.length); 
        if(fO[i]!==correctAnswer)fO.splice(i,1); 
    }
    
    while(fO.length<4){ 
        let fallback; 
        if(correctIsFraction)fallback=formatFractionHTML(`${fO.length+coeff+1}`,`${variable}<sup>${-exp+fO.length}</sup>`); 
        else fallback=formatTerm(fO.length+coeff+1,variable,exp+fO.length); 
        if(!fO.includes(fallback))fO.push(fallback); 
        else fO.push(`Option ${fO.length+1}`); 
    }
    
    return fO.sort(()=>Math.random()-0.5);
}

/**
 * Distractor generator for POWER rule with base coefficient 1 (e.g., "(x<sup>3</sup>)<sup>2</sup>").
 * **CORRECTED TRIM LOGIC**
 */
function generateDistractors_PowerBase1(correctResult, variable, n, m) {
    const { exp } = correctResult; // coeff is 1, exp = n * m
    let correctAnswer = formatTerm(1, variable, exp);
    if (correctAnswer === "") correctAnswer = "0"; // Should not happen if exp > 0

    let d = new Set(); d.add(correctAnswer);
    if (n + m !== exp && n+m > 0) { d.add(formatTerm(1, variable, n + m)); } // n+m exp, ensure > 0
    d.add(formatTerm(1, variable, exp + 1)); // Exp off by +1
    if (exp > 1) d.add(formatTerm(1, variable, exp - 1)); // Exp off by -1
    if (n !== exp && n > 0) d.add(formatTerm(1, variable, n)); // Original inner exp
    if (m !== exp && m > 0) d.add(formatTerm(1, variable, m)); // Original outer exp
    // Add coefficient 'm' only if m>1 and exp>0 (avoids adding coeff 1 if m=1)
    if (m !== 1 && exp > 0) d.add(formatTerm(m, variable, exp)); // Use outer exp as coeff

    let fO=Array.from(d).filter(opt=>opt!==''&&opt!==null); fO=fO.filter(opt=>opt!=="0"||correctAnswer==="0"); fO=Array.from(new Set(fO));

    // Fill logic
    let fillAttempts = 10;
    while(fO.length<4 && fillAttempts > 0){
        let rE=exp+(Math.floor(Math.random()*5)-2); // +/- 2 range
        if(rE === exp || rE < 1) { // Avoid correct exp and exp < 1
            fillAttempts--;
            continue;
        }
        if(rE===n+m||rE===n||rE===m) { // Avoid specific error exponents
             fillAttempts--;
             continue;
        }
        let rO=formatTerm(1,variable,rE);
        if(rO==="")rO="x"; // Fallback
        if(rO&&rO!=="0"&&!fO.includes(rO)){fO.push(rO);}
        fillAttempts--;
    }

    // Trim logic - **CORRECTED**
    while(fO.length > 4){
        let removed = false;
        // Try removing a random non-correct answer
        for(let k=0; k<fO.length; k++){ // Limit attempts to avoid infinite loop
             const i = Math.floor(Math.random()*fO.length);
             if(fO[i] !== correctAnswer){
                 fO.splice(i,1);
                 removed = true;
                 break; // Exit loop after removing one
             }
        }
         // Failsafe: If only correct answer left (shouldn't happen if fill/distractors work)
         if (!removed && fO.length > 1) {
             fO.pop(); // Remove the last element if it's not the correct one
         } else if (!removed) {
              console.warn("Trim PowerBase1 failsafe triggered.");
              break;
         }
    }

    // Fallback fill (should rarely be needed)
    while(fO.length<4){
        let fallback=formatTerm(1,variable,exp+fO.length+1);
        if(!fO.includes(fallback))fO.push(fallback); else fO.push(`Option ${fO.length+1}`);
    }
    return fO.sort(()=>Math.random()-0.5);
}
/**
 * Distractor generator for POWER rule answers (e.g., "8x<sup>6</sup>").
 * Prioritizes keeping the opposite-sign distractor when base 'a' is negative.
 */
function generateDistractors_Power(correctResult, variable, a, n, m) {
    const { coeff, exp } = correctResult; // coeff = a^m, exp = n*m
    let correctAnswer = formatTerm(coeff, variable, exp); if (correctAnswer === "") correctAnswer = "0";
    let d = new Set(); d.add(correctAnswer);
    let oppositeSignTerm = null; let oppositeSignCoeff = -coeff;
    if (a < 0) { oppositeSignTerm = formatTerm(oppositeSignCoeff, variable, exp); if (oppositeSignTerm && oppositeSignTerm !== correctAnswer && oppositeSignTerm !== "0") { d.add(oppositeSignTerm); } else { oppositeSignTerm = null; } }
    if (n + m !== exp) d.add(formatTerm(coeff, variable, n + m)); // n+m exp
    if (Math.abs(a) !== 1) { d.add(formatTerm(a, variable, n * m)); } // Apply m only to n
    let wrongCoeffAM = a * m; if (Math.abs(a) !== 1 && wrongCoeffAM !== coeff) { d.add(formatTerm(wrongCoeffAM, variable, exp)); } // a*m coeff
    d.add(formatTerm(coeff + 1, variable, exp)); d.add(formatTerm(coeff - 1, variable, exp)); d.add(formatTerm(coeff, variable, exp + 1)); if (exp > 1) d.add(formatTerm(coeff, variable, exp - 1));
    if (a >= 0 && coeff !== 0) { let negTerm = formatTerm(-coeff, variable, exp); if (negTerm && negTerm !== correctAnswer && negTerm !== "0" && !d.has(negTerm)) d.add(negTerm); }

    let fO=Array.from(d).filter(opt=>opt!==''&&opt!==null); fO=fO.filter(opt=>opt!=="0"||correctAnswer==="0"); fO=Array.from(new Set(fO));
    let maxFillTries = 10; while (fO.length < 4 && maxFillTries > 0) { let rC=coeff+(Math.floor(Math.random()*7)-3); let rE=exp+(Math.floor(Math.random()*3)-1); if(rE<1)rE=1; if(rE===n+m||rC===a*m){maxFillTries--; continue;} let rO=formatTerm(rC,variable,rE); if(rO===""&&rC===0)rO=formatTerm(1,variable,rE||1); if(rO==="")rO="x"; if(rO&&rO!=="0"&&!fO.includes(rO)){fO.push(rO);} maxFillTries--; }
    while (fO.length > 4) { let removed=false; for(let i=0; i<fO.length; i++){ const idx=Math.floor(Math.random()*fO.length); const item=fO[idx]; if(item!==correctAnswer&&item!==oppositeSignTerm){fO.splice(idx,1); removed=true; break;} } if(!removed&&fO.length>1){ for(let i=fO.length-1; i>=0; i--){ if(fO[i]!==correctAnswer){fO.splice(i,1); removed=true; break;} } } if(!removed&&fO.length>1){fO.pop();} else if(!removed){console.warn("Trim Power failsafe"); break;} }
    while (fO.length < 4) { let fallback=formatTerm(fO.length+Math.abs(coeff)+1,variable,exp+fO.length); if(!fO.includes(fallback))fO.push(fallback); else fO.push(`Option ${fO.length+1}`); }
    return fO.sort(() => Math.random() - 0.5);
}

/**
 * Distractor generator for COMBINED MULT/DIV answers (e.g., "6x<sup>3</sup>").
 */
function generateDistractors_CombinedOps(correctResult, variable, n, m, k) {
    const { coeff, exp } = correctResult; let cA=formatTerm(coeff,variable,exp); if(cA==="")cA="0";
    let d=new Set(); d.add(cA);
    d.add(formatTerm(coeff,variable,n+m+k)); d.add(formatTerm(coeff,variable,n*m-k)); d.add(formatTerm(coeff+1,variable,exp)); d.add(formatTerm(coeff-1,variable,exp)); d.add(formatTerm(coeff,variable,exp+1)); if(exp!==1)d.add(formatTerm(coeff,variable,exp-1)); d.add(formatTerm(-coeff,variable,exp)); if(exp!==0&&coeff!==0)d.add(formatConstant(coeff));
    let fO=Array.from(d).filter(opt=>opt!==''&&opt!==null); fO=fO.filter(opt=>opt!=="0"||cA==="0"); fO=Array.from(new Set(fO));
    while(fO.length<4){ let rC=coeff+(Math.floor(Math.random()*5)-2); let rE=exp+(Math.floor(Math.random()*3)-1); if(rE===0&&exp!==0)rE=exp>0?1:-1; let rO=formatTerm(rC,variable,rE); if(rO===""&&rC===0)rO=formatTerm(1,variable,rE||1); if(rO==="")rO="x"; if(rO&&rO!=="0"&&!fO.includes(rO)){fO.push(rO);} }
    while(fO.length>4){ const i=Math.floor(Math.random()*fO.length); if(fO[i]!==cA)fO.splice(i,1); }
    while(fO.length<4){ let fallback=formatTerm(fO.length+coeff+1,variable,exp+fO.length); if(!fO.includes(fallback))fO.push(fallback); else fO.push(`Option ${fO.length+1}`); }
    return fO.sort(()=>Math.random()-0.5);
}
/**
 * Distractor generator for Distributive Property answers (e.g., "6x + 3").
 */
function generateDistractors_Distributive(correctResult, variable, a, b, c) {
    const { xCoeff, constant } = correctResult; // xCoeff = a*b, constant = a*c
    let cA = '';
    if (xCoeff !== 0) cA = formatTerm(xCoeff, variable, 1);
    if (constant !== 0) cA += formatConstant(constant, xCoeff !== 0);
    if (cA === "") cA = "0";

    let d = new Set();
    d.add(cA); // Correct: abx + ac

    // Common error: Forgot to distribute to c
    let err1 = `${formatTerm(a * b, variable, 1)}${formatConstant(c, a * b !== 0)}`;
    if (err1 !== cA && err1 !== "0") d.add(err1); // abx + c

    // Common error: Forgot to multiply b
    let err2 = `${formatTerm(a, variable, 1)}${formatConstant(a * c, a !== 0)}`;
    if (err2 !== cA && err2 !== "0") d.add(err2); // ax + ac

    // Common error: Added a and b
    let err3 = `${formatTerm(a + b, variable, 1)}${formatConstant(a * c, a + b !== 0)}`;
    if (err3 !== cA && err3 !== "0") d.add(err3); // (a+b)x + ac

    // Common error: Added a and c
    let err4 = `${formatTerm(a * b, variable, 1)}${formatConstant(a + c, a * b !== 0)}`;
    if (err4 !== cA && err4 !== "0") d.add(err4); // abx + (a+c)

    // Common error: Total sum
    let sumErr = formatTerm(a + b + c, variable, 1);
    if (sumErr !== cA && sumErr !== "0") d.add(sumErr);


    let fO = Array.from(d).filter(opt => opt !== '' && opt !== null);
    fO = fO.filter(opt => opt !== "0" || cA === "0");
    fO = Array.from(new Set(fO));

    // Fill logic (similar to _Compound)
    let fillAttempts = 10;
    while (fO.length < 4 && fillAttempts > 0) {
        let rX = xCoeff + (Math.floor(Math.random() * 5) - 2);
        let rC = constant + (Math.floor(Math.random() * 5) - 2);
        if (rX === 0 && rC === 0) { fillAttempts--; continue; } // Avoid "0" unless correct
        let rO = `${formatTerm(rX, variable, 1)}${formatConstant(rC, rX !== 0)}`;
        if (rO === "") rO = "0";
        if (rO && !fO.includes(rO)) fO.push(rO);
        fillAttempts--;
    }
    
    // Trim logic
    while (fO.length > 4) {
        const i = Math.floor(Math.random() * fO.length);
        if (fO[i] !== cA) fO.splice(i, 1);
    }
    // Fallback fill
    while (fO.length < 4) {
        let fallback = `${fO.length + xCoeff}x + ${fO.length + constant}`;
        if (!fO.includes(fallback)) fO.push(fallback);
        else fO.push(`Option ${fO.length+1}`);
    }
    return fO.sort(() => Math.random() - 0.5);
}
/**
 * Distractor generator for Distributive Property with variable (e.g., "6x^2 - 3x").
 */
function generateDistractors_DistributiveVar(correctResult, variable, a, b, c) {
    const { term1Coeff, term2Coeff, term1Exp, term2Exp } = correctResult;
    // term1Coeff = a*b, term1Exp = 2
    // term2Coeff = a*c, term2Exp = 1
    let cA = '';
    if (term1Coeff !== 0) cA = formatTerm(term1Coeff, variable, term1Exp);
    if (term2Coeff !== 0) cA += formatTerm(term2Coeff, variable, term2Exp, term1Coeff !== 0);
    if (cA === "") cA = "0";

    let d = new Set();
    d.add(cA); // Correct: (ab)x^2 + (ac)x

    // Common error: Forgot to add exponents: (ab)x + (ac)x
    let err1 = `${formatTerm(a * b, variable, 1)}${formatTerm(a * c, variable, 1, a * b !== 0)}`;
    if (err1 !== cA && err1 !== "0") d.add(err1);

    // Common error: Forgot to distribute 'x' to 'c': (ab)x^2 + (ac)
    let err2 = `${formatTerm(a * b, variable, 2)}${formatConstant(a * c, a * b !== 0)}`;
    if (err2 !== cA && err2 !== "0") d.add(err2);

    // Common error: Forgot to distribute 'a' to 'c': (ab)x^2 + cx
    let err3 = `${formatTerm(a * b, variable, 2)}${formatTerm(c, variable, 1, a * b !== 0)}`;
    if (err3 !== cA && err3 !== "0") d.add(err3);
    
    // Common error: Added coefficients: (a+b)x^2 + (ac)x
    let err4 = `${formatTerm(a + b, variable, 2)}${formatTerm(a * c, variable, 1, a + b !== 0)}`;
    if (err4 !== cA && err4 !== "0") d.add(err4);

    let fO = Array.from(d).filter(opt => opt !== '' && opt !== null);
    fO = fO.filter(opt => opt !== "0" || cA === "0");
    fO = Array.from(new Set(fO));

    // Fill logic
    let fillAttempts = 10;
    while (fO.length < 4 && fillAttempts > 0) {
        let rC1 = term1Coeff + (Math.floor(Math.random() * 3) - 1);
        let rC2 = term2Coeff + (Math.floor(Math.random() * 3) - 1);
        let rE1 = term1Exp + (Math.floor(Math.random() * 3) - 1);
        if (rE1 < 1) rE1 = 1;
        let rO = `${formatTerm(rC1, variable, rE1)}${formatTerm(rC2, variable, term2Exp, rC1 !== 0)}`;
        if (rO === "") rO = "0";
        if (rO && !fO.includes(rO)) fO.push(rO);
        fillAttempts--;
    }
    
    // Trim logic
    while (fO.length > 4) {
        const i = Math.floor(Math.random() * fO.length);
        if (fO[i] !== cA) fO.splice(i, 1);
    }
    // Fallback fill
    while (fO.length < 4) {
        let fallback = `${fO.length + term1Coeff}x<sup>2</sup> + ${fO.length + term2Coeff}x`;
        if (!fO.includes(fallback)) fO.push(fallback);
        else fO.push(`Option ${fO.length+1}`);
    }
    return fO.sort(() => Math.random() - 0.5);
}
/**
 * Distractor generator for Distributive Property with exponents (e.g., "6x^5 + 9x^2").
 */
function generateDistractors_DistributiveVarExponent(correctResult, variable, a, n, b, m, c) {
    const { term1Coeff, term1Exp, term2Coeff, term2Exp } = correctResult;
    // term1Coeff = a*b, term1Exp = n+m
    // term2Coeff = a*c, term2Exp = n
    let cA = '';
    if (term1Coeff !== 0) cA = formatTerm(term1Coeff, variable, term1Exp);
    if (term2Coeff !== 0) cA += formatTerm(term2Coeff, variable, term2Exp, term1Coeff !== 0);
    if (cA === "") cA = "0";

    let d = new Set();
    d.add(cA); // Correct: (ab)x^(n+m) + (ac)x^n

    // Common error: Multiplied exponents: (ab)x^(n*m) + (ac)x^n
    if (n + m !== n * m) {
        let err1 = `${formatTerm(a * b, variable, n * m)}${formatTerm(a * c, variable, n, a * b !== 0)}`;
        if (err1 !== cA && err1 !== "0") d.add(err1);
    }

    // Common error: Forgot to distribute x^n to 'c': (ab)x^(n+m) + (ac)
    let err2 = `${formatTerm(a * b, variable, n + m)}${formatConstant(a * c, a * b !== 0)}`;
    if (err2 !== cA && err2 !== "0") d.add(err2);

    // Common error: Forgot to add exponents: (ab)x^n + (ac)x^n
    if (n + m !== n) {
        let err3 = `${formatTerm(a * b, variable, n)}${formatTerm(a * c, variable, n, a * b !== 0)}`;
        if (err3 !== cA && err3 !== "0") d.add(err3);
    }
    
    // Common error: Forgot to distribute 'a' to 'c': (ab)x^(n+m) + cx^n
    if (a * c !== c) {
        let err4 = `${formatTerm(a * b, variable, n + m)}${formatTerm(c, variable, n, a * b !== 0)}`;
        if (err4 !== cA && err4 !== "0") d.add(err4);
    }

    let fO = Array.from(d).filter(opt => opt !== '' && opt !== null);
    fO = fO.filter(opt => opt !== "0" || cA === "0");
    fO = Array.from(new Set(fO));

    // Fill logic
    let fillAttempts = 10;
    while (fO.length < 4 && fillAttempts > 0) {
        let rC1 = term1Coeff + (Math.floor(Math.random() * 3) - 1);
        let rC2 = term2Coeff + (Math.floor(Math.random() * 3) - 1);
        let rE1 = term1Exp + (Math.floor(Math.random() * 3) - 1);
        let rE2 = term2Exp + (Math.floor(Math.random() * 3) - 1);
        if (rE1 < 1) rE1 = 1;
        if (rE2 < 1) rE2 = 1;
        if (rE1 === rE2) rE1++; // Avoid identical exponents
        let rO = `${formatTerm(rC1, variable, rE1)}${formatTerm(rC2, variable, rE2, rC1 !== 0)}`;
        if (rO === "") rO = "0";
        if (rO && !fO.includes(rO)) fO.push(rO);
        fillAttempts--;
    }
    
    // Trim logic
    while (fO.length > 4) {
        const i = Math.floor(Math.random() * fO.length);
        if (fO[i] !== cA) fO.splice(i, 1);
    }
    // Fallback fill
    while (fO.length < 4) {
        let fallback = `${fO.length + term1Coeff}x<sup>${term1Exp}</sup> + ${fO.length + term2Coeff}x<sup>${term2Exp}</sup>`;
        if (!fO.includes(fallback)) fO.push(fallback);
        else fO.push(`Option ${fO.length+1}`);
    }
    return fO.sort(() => Math.random() - 0.5);
}
/**
 * Distractor generator for Distributive Property, two variable terms (e.g., "6x^5 + 8x^3").
 */
function generateDistractors_DistributiveMultiVarExponent(correctResult, variable, a, n, b, m, c, p) {
    const { term1Coeff, term1Exp, term2Coeff, term2Exp } = correctResult;
    // t1C = a*b, t1E = n+m
    // t2C = a*c, t2E = n+p
    let cA = '';
    if (term1Coeff !== 0) cA = formatTerm(term1Coeff, variable, term1Exp);
    if (term2Coeff !== 0) cA += formatTerm(term2Coeff, variable, term2Exp, term1Coeff !== 0);
    if (cA === "") cA = "0";

    let d = new Set();
    d.add(cA); // Correct: (ab)x^(n+m) + (ac)x^(n+p)

    // Common error: Multiplied exponents: (ab)x^(n*m) + (ac)x^(n*p)
    if (n + m !== n * m || n + p !== n * p) {
        let err1 = `${formatTerm(a * b, variable, n * m)}${formatTerm(a * c, variable, n * p, a * b !== 0)}`;
        if (err1 !== cA && err1 !== "0") d.add(err1);
    }

    // Common error: Forgot to add 'n' to 'p': (ab)x^(n+m) + (ac)x^p
    let err2 = `${formatTerm(a * b, variable, n + m)}${formatTerm(a * c, variable, p, a * b !== 0)}`;
    if (err2 !== cA && err2 !== "0" && p !== n+p) d.add(err2);

    // Common error: Forgot to add 'n' to 'm': (ab)x^m + (ac)x^(n+p)
    let err3 = `${formatTerm(a * b, variable, m)}${formatTerm(a * c, variable, n + p, a * b !== 0)}`;
    if (err3 !== cA && err3 !== "0" && m !== n+m) d.add(err3);
    
    // Common error: Forgot to distribute 'x^n' at all: (ab)x^m + (ac)x^p
    let err4 = `${formatTerm(a * b, variable, m)}${formatTerm(a * c, variable, p, a * b !== 0)}`;
    if (err4 !== cA && err4 !== "0") d.add(err4);

    let fO = Array.from(d).filter(opt => opt !== '' && opt !== null);
    fO = fO.filter(opt => opt !== "0" || cA === "0");
    fO = Array.from(new Set(fO));

    // Fill logic
    let fillAttempts = 10;
    while (fO.length < 4 && fillAttempts > 0) {
        let rC1 = term1Coeff + (Math.floor(Math.random() * 3) - 1);
        let rC2 = term2Coeff + (Math.floor(Math.random() * 3) - 1);
        let rE1 = term1Exp + (Math.floor(Math.random() * 3) - 1);
        let rE2 = term2Exp + (Math.floor(Math.random() * 3) - 1);
        if (rE1 < 1) rE1 = 1; if (rE2 < 1) rE2 = 1; if (rE1 === rE2) rE1++; // Avoid identical exponents
        
        let rO = `${formatTerm(rC1, variable, rE1)}${formatTerm(rC2, variable, rE2, rC1 !== 0)}`;
        if (rO === "") rO = "0";
        if (rO && !fO.includes(rO)) fO.push(rO);
        fillAttempts--;
    }
    
    // Trim logic
    while (fO.length > 4) {
        const i = Math.floor(Math.random() * fO.length);
        if (fO[i] !== cA) fO.splice(i, 1);
    }
    // Fallback fill
    while (fO.length < 4) {
        let fallback = `${fO.length + term1Coeff}x<sup>${term1Exp}</sup> + ${fO.length + term2Coeff}x<sup>${term2Exp}</sup>`;
        if (!fO.includes(fallback)) fO.push(fallback);
        else fO.push(`Option ${fO.length+1}`);
    }
    return fO.sort(() => Math.random() - 0.5);
}
/**
 * Distractor generator for Multi-Variable Multiplication (e.g., "x^5y^2").
 * (IMPROVED with more specific exponent errors)
 */
function generateDistractors_MultiVarMultiply(correctResult, var1, var2, n, m, k) {
    const { xCoeff, yCoeff, xExp, yExp } = correctResult; // xCoeff=1, yCoeff=1, xExp=n+k, yExp=m
    
    // Format: x^a * y^b
    let cA = `${formatTerm(xCoeff, var1, xExp)}${formatTerm(yCoeff, var2, yExp)}`;
    if (cA === "") cA = "0";

    let d = new Set();
    d.add(cA); // Correct: x^(n+k) * y^m

    // --- NEW DISTRACTORS BASED ON YOUR SUGGESTION ---

    // Error 1: Multiplied x exponents: x^(n*k) * y^m
    let err1_xExp = n * k;
    if (err1_xExp !== xExp && err1_xExp > 0) {
        d.add(`${formatTerm(1, var1, err1_xExp)}${formatTerm(1, var2, yExp)}`);
    }

    // Error 2: Added ALL exponents to x: x^(n+m+k) * y^m
    let err2_xExp = n + m + k;
    if (err2_xExp !== xExp) {
        d.add(`${formatTerm(1, var1, err2_xExp)}${formatTerm(1, var2, yExp)}`);
    }
    
    // Error 3: Swapped exponents: x^m * y^(n+k)
    let err3_xExp = m;
    let err3_yExp = n + k; // (which is the correct xExp)
    if (err3_xExp !== xExp || err3_yExp !== yExp) {
         d.add(`${formatTerm(1, var1, err3_xExp)}${formatTerm(1, var2, err3_yExp)}`);
    }
    
    // Error 4: Applied correct x-exp to y as well: x^(n+k) * y^(n+k)
    if (xExp !== yExp) {
        d.add(`${formatTerm(1, var1, xExp)}${formatTerm(1, var2, xExp)}`);
    }

    // --- KEEPING OLD GOOD DISTRACTORS ---
    
    // Error 5: Kept x's separate (unsimplified): x^n * y^m * x^k
    let err5 = `${formatTerm(1, var1, n)}${formatTerm(1, var2, m)}${formatTerm(1, var1, k)}`;
    if (err5 !== cA) d.add(err5);
    
    // Error 6: Combined x and y base: (xy)^(n+m+k)
    let err6 = `(${var1}${var2})<sup>${n + m + k}</sup>`;
    if (err6 !== cA) d.add(err6);

    // --- FILL/TRIM LOGIC (Unchanged) ---
    let fO = Array.from(d).filter(opt => opt !== '' && opt !== null);
    fO = fO.filter(opt => opt !== "0" || cA === "0");
    fO = Array.from(new Set(fO));

    // Fill logic
    let fillAttempts = 10;
    while (fO.length < 4 && fillAttempts > 0) {
        let rXE = xExp + (Math.floor(Math.random() * 3) - 1);
        let rYE = yExp + (Math.floor(Math.random() * 3) - 1);
        if (rXE < 1) rXE = 1; if (rYE < 1) rYE = 1; if (rXE === xExp && rYE === yExp) rXE++;
        
        let rO = `${formatTerm(1, var1, rXE)}${formatTerm(1, var2, rYE)}`;
        if (rO === "") rO = "0";
        if (rO && !fO.includes(rO)) fO.push(rO);
        fillAttempts--;
    }
    
    // Trim logic
    while (fO.length > 4) {
        const i = Math.floor(Math.random() * fO.length);
        if (fO[i] !== cA) fO.splice(i, 1);
    }
    // Fallback fill
    while (fO.length < 4) {
        let fallback = `${formatTerm(1, var1, xExp + fO.length)}${formatTerm(1, var2, yExp + 1)}`;
        if (!fO.includes(fallback)) fO.push(fallback);
        else fO.push(`Option ${fO.length+1}`);
    }
    return fO.sort(() => Math.random() - 0.5);
}
/**
 * Distractor generator for Multi-Variable Multiplication with Coeffs (e.g., "30x^5y^2").
 */
function generateDistractors_MultiVarMultiplyCoeff(correctResult, var1, var2, a, b, c, n, m, k) {
    const { xCoeff, yCoeff, xExp, yExp } = correctResult; // xCoeff=a*b*c, yCoeff=1, xExp=n+k, yExp=m
    
    // Format: (abc)x^a * y^b
    let cA = `${formatTerm(xCoeff, var1, xExp)}${formatTerm(yCoeff, var2, yExp)}`;
    if (cA === "") cA = "0";

    let d = new Set();
    d.add(cA); // Correct: (abc)x^(n+k) * y^m
	
	// Error: Opposite sign
    if (xCoeff !== 0) {
        d.add(`${formatTerm(-xCoeff, var1, xExp)}${formatTerm(yCoeff, var2, yExp)}`);
    }

    // --- DISTRACTORS ---

    // Error 1: Added coefficients: (a+b+c)x^(n+k) * y^m
    let errCoeff1 = a + b + c;
    if (errCoeff1 !== xCoeff) {
        d.add(`${formatTerm(errCoeff1, var1, xExp)}${formatTerm(yCoeff, var2, yExp)}`);
    }

    // Error 2: Multiplied x exponents: (abc)x^(n*k) * y^m
    let errExp1 = n * k;
    if (errExp1 !== xExp && errExp1 > 0) {
        d.add(`${formatTerm(xCoeff, var1, errExp1)}${formatTerm(yCoeff, var2, yExp)}`);
    }

    // Error 3: Added ALL exponents to x: (abc)x^(n+m+k) * y^m
    let errExp2 = n + m + k;
    if (errExp2 !== xExp) {
        d.add(`${formatTerm(xCoeff, var1, errExp2)}${formatTerm(yCoeff, var2, yExp)}`);
    }
    
    // Error 4: Swapped exponents: (abc)x^m * y^(n+k)
    let errExp3_x = m;
    let errExp3_y = n + k;
    if (errExp3_x !== xExp || errExp3_y !== yExp) {
         d.add(`${formatTerm(xCoeff, var1, errExp3_x)}${formatTerm(yCoeff, var2, errExp3_y)}`);
    }
    
    // Error 5: Forgot one coefficient (e.g., 'b'): (ac)x^(n+k) * y^m
    let errCoeff2 = a * c;
    if (errCoeff2 !== xCoeff && b !== 1) { // Only a valid error if b is not 1
        d.add(`${formatTerm(errCoeff2, var1, xExp)}${formatTerm(yCoeff, var2, yExp)}`);
    }

    // --- FILL/TRIM LOGIC ---
    let fO = Array.from(d).filter(opt => opt !== '' && opt !== null);
    fO = fO.filter(opt => opt !== "0" || cA === "0");
    fO = Array.from(new Set(fO));

    // Fill logic
    let fillAttempts = 10;
    while (fO.length < 4 && fillAttempts > 0) {
        // Vary either coeff or exponents
        let rC = xCoeff + (Math.floor(Math.random() * 3) - 1) * a; // Vary coeff by 'a'
        if (rC === xCoeff) rC += (b > 1 ? b : 2); // ensure it changes
        if (rC === 0) rC = a + c; // Avoid 0
        let rXE = xExp + (Math.floor(Math.random() * 3) - 1);
        let rYE = yExp + (Math.floor(Math.random() * 3) - 1);
        if (rXE < 1) rXE = 1; if (rYE < 1) rYE = 1; 
        if (rC === xCoeff && rXE === xExp && rYE === yExp) rXE++; // Avoid correct
        
        let rO = `${formatTerm(rC, var1, rXE)}${formatTerm(1, var2, rYE)}`;
        if (rO === "") rO = "0";
        if (rO && !fO.includes(rO)) fO.push(rO);
        fillAttempts--;
    }
    
    // Trim logic
    while (fO.length > 4) {
        const i = Math.floor(Math.random() * fO.length);
        if (fO[i] !== cA) fO.splice(i, 1);
    }
    // Fallback fill
    while (fO.length < 4) {
        let fallback = `${formatTerm(xCoeff + fO.length, var1, xExp + fO.length)}${formatTerm(1, var2, yExp + 1)}`;
        if (!fO.includes(fallback)) fO.push(fallback);
        else fO.push(`Option ${fO.length+1}`);
    }
    return fO.sort(() => Math.random() - 0.5);
}
/**
 * Distractor generator for Difference of Squares: (x+a)(x-a) = x^2 - a^2
 */
function generateDistractors_DifferenceOfSquares(correctResult, variable, a) {
    const { term1Coeff, term1Exp, constant } = correctResult; // 1, 2, -a^2
    let cA = '';
    if (term1Coeff !== 0) cA = formatTerm(term1Coeff, variable, term1Exp);
    if (constant !== 0) cA += formatConstant(constant, term1Coeff !== 0);
    if (cA === "") cA = "0"; // Correct answer: "x^2 - a^2"

    let d = new Set();
    d.add(cA);

    // Common error 1: (x+a)^2 -> x^2 + 2ax + a^2
    let err1_const = a * a;
    let err1_xCoeff = 2 * a;
    let err1 = `${formatTerm(1, variable, 2)}${formatTerm(err1_xCoeff, variable, 1, true)}${formatConstant(err1_const, true)}`;
    if (err1 !== cA) d.add(err1);

    // Common error 2: (x-a)^2 -> x^2 - 2ax + a^2
    let err2_xCoeff = -2 * a;
    let err2 = `${formatTerm(1, variable, 2)}${formatTerm(err2_xCoeff, variable, 1, true)}${formatConstant(err1_const, true)}`;
    if (err2 !== cA) d.add(err2);

    // Common error 3: Wrong sign on constant -> x^2 + a^2
    let err3 = `${formatTerm(1, variable, 2)}${formatConstant(a * a, true)}`;
    if (err3 !== cA) d.add(err3);
    
    // Common error 4: Forgot exponent on x -> x - a^2
    let err4 = `${formatTerm(1, variable, 1)}${formatConstant(constant, true)}`;
    if (err4 !== cA) d.add(err4);

    // Common error 5: Forgot x^2 term -> -a^2 (just the constant)
    let err5 = formatConstant(constant, false);
    if (err5 !== cA && err5 !== "0") d.add(err5);

    let fO = Array.from(d).filter(opt => opt !== '' && opt !== null);
    fO = fO.filter(opt => opt !== "0" || cA === "0");
    fO = Array.from(new Set(fO));

    // Fill logic
    let fillAttempts = 10;
    while (fO.length < 4 && fillAttempts > 0) {
        let rC = constant + (Math.floor(Math.random() * 5) - 2); // Vary constant
        let rE = term1Exp + (Math.floor(Math.random() * 3) - 1); // Vary exponent
        if (rE < 1) rE = 1;
        if (rC === constant && rE === term1Exp) { fillAttempts--; continue; }
        
        let rO = `${formatTerm(1, variable, rE)}${formatConstant(rC, true)}`;
        if (rO === "") rO = "0";
        if (rO && !fO.includes(rO)) fO.push(rO);
        fillAttempts--;
    }
    
    // Trim logic
    while (fO.length > 4) {
        const i = Math.floor(Math.random() * fO.length);
        if (fO[i] !== cA) fO.splice(i, 1);
    }
    // Fallback fill
    while (fO.length < 4) {
        let fallback = `${formatTerm(1, variable, term1Exp + fO.length)}${formatConstant(constant - fO.length, true)}`;
        if (!fO.includes(fallback)) fO.push(fallback);
        else fO.push(`Option ${fO.length+1}`);
    }
    return fO.sort(() => Math.random() - 0.5);
}
/**
 * Distractor generator for Perfect Squares: (x+a)^2 or (x-a)^2
 * Handles (x+a)^2 = x^2 + 2ax + a^2
 * and (x-a)^2 = x^2 - 2ax + a^2
 */
function generateDistractors_PerfectSquare(correctResult, variable, a) {
    const { term1Coeff, term1Exp, term2Coeff, term2Exp, constant } = correctResult;
    // correct answer is x^2 + (2a)x + a^2 OR x^2 - (2a)x + a^2
    // 'a' is passed in as its absolute value (e.g., 5)

    let cA = '';
    if (term1Coeff !== 0) cA = formatTerm(term1Coeff, variable, term1Exp); // x^2
    if (term2Coeff !== 0) cA += formatTerm(term2Coeff, variable, term2Exp, true); // +2ax or -2ax
    if (constant !== 0) cA += formatConstant(constant, true); // +a^2
    if (cA === "") cA = "0";

    let d = new Set();
    d.add(cA); // Add the correct answer

    // Error 1: The *other* perfect square.
    // If correct middle coeff (term2Coeff) is positive, show the negative version, and vice-versa.
    let oppositeMiddleCoeff = -term2Coeff;
    let err1 = `${formatTerm(term1Coeff, variable, term1Exp)}${formatTerm(oppositeMiddleCoeff, variable, term2Exp, true)}${formatConstant(constant, true)}`;
    if (err1 !== cA) d.add(err1); // e.g., x^2 - 2ax + a^2

    // Error 2: Forgot the middle term (common error) -> x^2 + a^2
    let err2 = `${formatTerm(term1Coeff, variable, term1Exp)}${formatConstant(constant, true)}`;
    if (err2 !== cA) d.add(err2);

    // Error 3: Difference of squares (another common error) -> x^2 - a^2
    let err3_const = -constant; // -a^2
    let err3 = `${formatTerm(term1Coeff, variable, term1Exp)}${formatConstant(err3_const, true)}`;
    if (err3 !== cA) d.add(err3);

    // Error 4: Wrong sign on constant (e.g., x^2 + 2ax - a^2)
    let err4 = `${formatTerm(term1Coeff, variable, term1Exp)}${formatTerm(term2Coeff, variable, term2Exp, true)}${formatConstant(err3_const, true)}`;
    if (err4 !== cA) d.add(err4);


    let fO = Array.from(d).filter(opt => opt !== '' && opt !== null);
    fO = fO.filter(opt => opt !== "0" || cA === "0");
    fO = Array.from(new Set(fO));

    // Fill logic
    let fillAttempts = 10;
    while (fO.length < 4 && fillAttempts > 0) {
        // Vary middle term or constant
        let rC = constant + (Math.floor(Math.random() * 5) - 2);
        let rX = term2Coeff + (Math.floor(Math.random() * 5) - 2);
        if (rC === constant && rX === term2Coeff) { fillAttempts--; continue; }

        let rO = `${formatTerm(term1Coeff, variable, term1Exp)}${formatTerm(rX, variable, term2Exp, true)}${formatConstant(rC, true)}`;
        if (rO === "") rO = "0";
        if (rO && !fO.includes(rO)) fO.push(rO);
        fillAttempts--;
    }
    
    // Trim logic
    while (fO.length > 4) {
        const i = Math.floor(Math.random() * fO.length);
        if (fO[i] !== cA) fO.splice(i, 1);
    }
    // Fallback fill
    while (fO.length < 4) {
        let fallback = `${formatTerm(term1Coeff, variable, term1Exp)}${formatTerm(term2Coeff + fO.length, variable, term2Exp, true)}${formatConstant(constant + fO.length, true)}`;
        if (!fO.includes(fallback)) fO.push(fallback);
        else fO.push(`Option ${fO.length+1}`);
    }
    return fO.sort(() => Math.random() - 0.5);
}
/**
 * Distractor generator for Difference of Squares w/ Coeff: (ax+b)(ax-b) = a^2x^2 - b^2
 */
function generateDistractors_DifferenceOfSquaresCoeff(correctResult, variable, a, b) {
    const { term1Coeff, term1Exp, constant } = correctResult; // a^2, 2, -b^2
    let cA = '';
    if (term1Coeff !== 0) cA = formatTerm(term1Coeff, variable, term1Exp);
    if (constant !== 0) cA += formatConstant(constant, term1Coeff !== 0);
    if (cA === "") cA = "0"; // Correct answer: "a^2x^2 - b^2"

    let d = new Set();
    d.add(cA);

    // Common error 1: (ax+b)^2 -> a^2x^2 + 2abx + b^2
    let err1_xCoeff = 2 * a * b;
    let err1_const = b * b;
    let err1 = `${formatTerm(term1Coeff, variable, 2)}${formatTerm(err1_xCoeff, variable, 1, true)}${formatConstant(err1_const, true)}`;
    if (err1 !== cA) d.add(err1);

    // Common error 2: (ax-b)^2 -> a^2x^2 - 2abx + b^2
    let err2_xCoeff = -2 * a * b;
    let err2 = `${formatTerm(term1Coeff, variable, 2)}${formatTerm(err2_xCoeff, variable, 1, true)}${formatConstant(err1_const, true)}`;
    if (err2 !== cA) d.add(err2);

    // Common error 3: Forgot to square 'a' -> ax^2 - b^2
    let err3 = `${formatTerm(a, variable, 2)}${formatConstant(constant, true)}`;
    if (err3 !== cA) d.add(err3);
    
    // Common error 4: Wrong sign on constant -> a^2x^2 + b^2
    let err4 = `${formatTerm(term1Coeff, variable, 2)}${formatConstant(err1_const, true)}`;
    if (err4 !== cA) d.add(err4);

    // Common error 5: Forgot to square 'b' -> a^2x^2 - b
    let err5 = `${formatTerm(term1Coeff, variable, 2)}${formatConstant(-b, true)}`;
    if (err5 !== cA) d.add(err5);

    let fO = Array.from(d).filter(opt => opt !== '' && opt !== null);
    fO = fO.filter(opt => opt !== "0" || cA === "0");
    fO = Array.from(new Set(fO));

    // Fill logic
    let fillAttempts = 10;
    while (fO.length < 4 && fillAttempts > 0) {
        let rC = constant + (Math.floor(Math.random() * 5) - 2); // Vary constant
        let rTC = term1Coeff + (Math.floor(Math.random() * 3) - 1); // Vary term 1 coeff
        if (rC === constant && rTC === term1Coeff) { fillAttempts--; continue; }
        
        let rO = `${formatTerm(rTC, variable, 2)}${formatConstant(rC, true)}`;
        if (rO === "") rO = "0";
        if (rO && !fO.includes(rO)) fO.push(rO);
        fillAttempts--;
    }
    
    // Trim logic
    while (fO.length > 4) {
        const i = Math.floor(Math.random() * fO.length);
        if (fO[i] !== cA) fO.splice(i, 1);
    }
    // Fallback fill
    while (fO.length < 4) {
        let fallback = `${formatTerm(term1Coeff + fO.length, variable, 2)}${formatConstant(constant - fO.length, true)}`;
        if (!fO.includes(fallback)) fO.push(fallback);
        else fO.push(`Option ${fO.length+1}`);
    }
    return fO.sort(() => Math.random() - 0.5);
}
/**
 * Distractor generator for Perfect Squares w/ Coeff: (ax+b)^2 or (ax-b)^2
 * Handles (ax+b)^2 = a^2x^2 + 2abx + b^2
 * and (ax-b)^2 = a^2x^2 - 2abx + b^2
 */
function generateDistractors_PerfectSquareCoeff(correctResult, variable, a, b) {
    const { term1Coeff, term1Exp, term2Coeff, term2Exp, constant } = correctResult;
    // correct is a^2x^2 ± 2abx + b^2

    let cA = '';
    if (term1Coeff !== 0) cA = formatTerm(term1Coeff, variable, term1Exp); // a^2x^2
    if (term2Coeff !== 0) cA += formatTerm(term2Coeff, variable, term2Exp, true); // ±2abx
    if (constant !== 0) cA += formatConstant(constant, true); // +b^2
    if (cA === "") cA = "0";

    let d = new Set();
    d.add(cA); // Add the correct answer

    // Error 1: The *other* perfect square (opposite middle term)
    let oppositeMiddleCoeff = -term2Coeff;
    let err1 = `${formatTerm(term1Coeff, variable, term1Exp)}${formatTerm(oppositeMiddleCoeff, variable, term2Exp, true)}${formatConstant(constant, true)}`;
    if (err1 !== cA) d.add(err1); // e.g., a^2x^2 - 2abx + b^2

    // Error 2: Forgot the middle term (common error) -> a^2x^2 + b^2
    let err2 = `${formatTerm(term1Coeff, variable, term1Exp)}${formatConstant(constant, true)}`;
    if (err2 !== cA) d.add(err2);

    // Error 3: Difference of squares (another common error) -> a^2x^2 - b^2
    let err3_const = -constant; // -b^2
    let err3 = `${formatTerm(term1Coeff, variable, term1Exp)}${formatConstant(err3_const, true)}`;
    if (err3 !== cA) d.add(err3);

    // Error 4: Forgot to square 'a' -> ax^2 + 2abx + b^2
    let err4 = `${formatTerm(a, variable, term1Exp)}${formatTerm(term2Coeff, variable, term2Exp, true)}${formatConstant(constant, true)}`;
    if (err4 !== cA) d.add(err4);

    // Error 5: Forgot to square 'b' -> a^2x^2 + 2abx + b
    let err5 = `${formatTerm(term1Coeff, variable, term1Exp)}${formatTerm(term2Coeff, variable, term2Exp, true)}${formatConstant(b, true)}`;
    if (err5 !== cA) d.add(err5);

    let fO = Array.from(d).filter(opt => opt !== '' && opt !== null);
    fO = fO.filter(opt => opt !== "0" || cA === "0");
    fO = Array.from(new Set(fO));

    // Fill logic
    let fillAttempts = 10;
    while (fO.length < 4 && fillAttempts > 0) {
        let rC = constant + (Math.floor(Math.random() * 5) - 2);
        let rX = term2Coeff + (Math.floor(Math.random() * 5) - 2) * a;
        if (rC === constant && rX === term2Coeff) { fillAttempts--; continue; }

        let rO = `${formatTerm(term1Coeff, variable, term1Exp)}${formatTerm(rX, variable, term2Exp, true)}${formatConstant(rC, true)}`;
        if (rO === "") rO = "0";
        if (rO && !fO.includes(rO)) fO.push(rO);
        fillAttempts--;
    }
    
    // Trim logic
    while (fO.length > 4) {
        const i = Math.floor(Math.random() * fO.length);
        if (fO[i] !== cA) fO.splice(i, 1);
    }
    // Fallback fill
    while (fO.length < 4) {
        let fallback = `${formatTerm(term1Coeff + fO.length, variable, term1Exp)}${formatTerm(term2Coeff + fO.length, variable, term2Exp, true)}${formatConstant(constant + fO.length, true)}`;
        if (!fO.includes(fallback)) fO.push(fallback);
        else fO.push(`Option ${fO.length+1}`);
    }
    return fO.sort(() => Math.random() - 0.5);
}
/**
 * Distractor generator for General Binomial Multiplication: (ax+b)(cx+d)
 * Result: (ac)x^2 + (ad+bc)x + (bd)
 */
function generateDistractors_GeneralBinomial(correctResult, variable, a, b, c, d) {
    const { term1Coeff, term1Exp, term2Coeff, term2Exp, constant } = correctResult;
    // t1Coeff = a*c
    // t2Coeff = a*d + b*c
    // constant = b*d

    let cA = '';
    if (term1Coeff !== 0) cA = formatTerm(term1Coeff, variable, term1Exp); // (ac)x^2
    if (term2Coeff !== 0) cA += formatTerm(term2Coeff, variable, term2Exp, true); // +(ad+bc)x
    if (constant !== 0) cA += formatConstant(constant, true); // +(bd)
    if (cA === "") cA = "0";

    let dSet = new Set();
    dSet.add(cA); // Add the correct answer

    // Error 1: "First + Last" only. Forgot O & I. -> (ac)x^2 + (bd)
    let err1 = `${formatTerm(term1Coeff, variable, term1Exp)}${formatConstant(constant, true)}`;
    if (err1 !== cA && err1 !== "0") dSet.add(err1);

    // Error 2: "Smiley Face" error. (ax+b)(cx+d) -> (a+c)x + (b+d)
    let err2 = `${formatTerm(a + c, variable, 1)}${formatConstant(b + d, true)}`;
    if (err2 !== cA && err2 !== "0") dSet.add(err2);

    // Error 3: Wrong middle term (forgot one part). -> (ac)x^2 + (ad)x + (bd)
    let err3_mid = a * d;
    let err3 = `${formatTerm(term1Coeff, variable, term1Exp)}${formatTerm(err3_mid, variable, term2Exp, true)}${formatConstant(constant, true)}`;
    if (err3 !== cA && err3_mid !== term2Coeff) dSet.add(err3);

    // Error 4: Wrong middle term (forgot other part). -> (ac)x^2 + (bc)x + (bd)
    let err4_mid = b * c;
    let err4 = `${formatTerm(term1Coeff, variable, term1Exp)}${formatTerm(err4_mid, variable, term2Exp, true)}${formatConstant(constant, true)}`;
    if (err4 !== cA && err4_mid !== term2Coeff) dSet.add(err4);
    
    // Error 5: Sign error on constant. -> (ac)x^2 + (ad+bc)x - (bd)
    let err5_const = -constant;
    let err5 = `${formatTerm(term1Coeff, variable, term1Exp)}${formatTerm(term2Coeff, variable, term2Exp, true)}${formatConstant(err5_const, true)}`;
    if (err5 !== cA) dSet.add(err5);

    let fO = Array.from(dSet).filter(opt => opt !== '' && opt !== null);
    fO = fO.filter(opt => opt !== "0" || cA === "0");
    fO = Array.from(new Set(fO));

    // Fill logic
    let fillAttempts = 10;
    while (fO.length < 4 && fillAttempts > 0) {
        let rT1 = term1Coeff + (Math.floor(Math.random() * 3) - 1);
        let rT2 = term2Coeff + (Math.floor(Math.random() * 5) - 2);
        let rC = constant + (Math.floor(Math.random() * 5) - 2);
        if (rT1 === 0 && rT2 === 0 && rC === 0) { fillAttempts--; continue; }
        if (rT1 === term1Coeff && rT2 === term2Coeff && rC === constant) { fillAttempts--; continue; }

        let rO = `${formatTerm(rT1, variable, term1Exp)}${formatTerm(rT2, variable, term2Exp, true)}${formatConstant(rC, true)}`;
        if (rO === "") rO = "0";
        if (rO && !fO.includes(rO)) fO.push(rO);
        fillAttempts--;
    }
    
    // Trim logic
    while (fO.length > 4) {
        const i = Math.floor(Math.random() * fO.length);
        if (fO[i] !== cA) fO.splice(i, 1);
    }
    // Fallback fill
    while (fO.length < 4) {
        let fallback = `${formatTerm(term1Coeff + fO.length, variable, term1Exp)}${formatTerm(term2Coeff + fO.length, variable, term2Exp, true)}${formatConstant(constant + fO.length, true)}`;
        if (!fO.includes(fallback)) fO.push(fallback);
        else fO.push(`Option ${fO.length+1}`);
    }
    return fO.sort(() => Math.random() - 0.5);
}
/**
 * Distractor generator for Simple Polynomial Division: (ax+b) / c
 * Result: (a/c)x + (b/c)
 */
function generateDistractors_SimpleDivision(correctResult, variable, a, b, c) {
    const { xCoeff, constant } = correctResult; // xCoeff = a/c, constant = b/c
    let cA = '';
    if (xCoeff !== 0) cA = formatTerm(xCoeff, variable, 1);
    if (constant !== 0) cA += formatConstant(constant, xCoeff !== 0);
    if (cA === "") cA = "0";

    let dSet = new Set();
    dSet.add(cA); // Correct: (a/c)x + (b/c)

    // Error 1: Only divided first term -> (a/c)x + b
    let err1 = `${formatTerm(xCoeff, variable, 1)}${formatConstant(b, xCoeff !== 0)}`;
    if (err1 !== cA && err1 !== "0") dSet.add(err1);

    // Error 2: Only divided second term -> ax + (b/c)
    let err2 = `${formatTerm(a, variable, 1)}${formatConstant(constant, a !== 0)}`;
    if (err2 !== cA && err2 !== "0") dSet.add(err2);

    // Error 3: Multiplied instead -> (ac)x + (bc)
    let err3 = `${formatTerm(a * c, variable, 1)}${formatConstant(b * c, a * c !== 0)}`;
    if (err3 !== cA && err3 !== "0") dSet.add(err3);
    
    // Error 4: Sign error on constant
    let err4 = `${formatTerm(xCoeff, variable, 1)}${formatConstant(-constant, xCoeff !== 0)}`;
    if (err4 !== cA && err4 !== "0") dSet.add(err4);

    let fO = Array.from(dSet).filter(opt => opt !== '' && opt !== null);
    fO = fO.filter(opt => opt !== "0" || cA === "0");
    fO = Array.from(new Set(fO));

    // Fill logic
    let fillAttempts = 10;
    while (fO.length < 4 && fillAttempts > 0) {
        let rX = xCoeff + (Math.floor(Math.random() * 3) - 1);
        let rC = constant + (Math.floor(Math.random() * 5) - 2);
        if (rX === 0 && rC === 0) { fillAttempts--; continue; }
        if (rX === xCoeff && rC === constant) { fillAttempts--; continue; }

        let rO = `${formatTerm(rX, variable, 1)}${formatConstant(rC, rX !== 0)}`;
        if (rO === "") rO = "0";
        if (rO && !fO.includes(rO)) fO.push(rO);
        fillAttempts--;
    }
    
    // Trim logic
    while (fO.length > 4) {
        const i = Math.floor(Math.random() * fO.length);
        if (fO[i] !== cA) fO.splice(i, 1);
    }
    // Fallback fill
    while (fO.length < 4) {
        let fallback = `${formatTerm(xCoeff + fO.length, variable, 1)}${formatConstant(constant + fO.length, true)}`;
        if (!fO.includes(fallback)) fO.push(fallback);
        else fO.push(`Option ${fO.length+1}`);
    }
    return fO.sort(() => Math.random() - 0.5);
}
/**
 * Distractor generator for Binomial/Monomial Division: (ax^k + bx^m) / cx^n
 * Result: (a/c)x^(k-n) + (b/c)x^(m-n)
 */
function generateDistractors_MonomialDivision(correctResult, variable, a, b, c, k, m, n) {
    const { term1Coeff, term1Exp, term2Coeff, term2Exp } = correctResult;
    // t1C = a/c, t1E = k-n
    // t2C = b/c, t2E = m-n

    let cA = '';
    if (term1Coeff !== 0) cA = formatTerm(term1Coeff, variable, term1Exp);
    if (term2Coeff !== 0) cA += formatTerm(term2Coeff, variable, term2Exp, term1Coeff !== 0);
    if (cA === "") cA = "0";

    let dSet = new Set();
    dSet.add(cA); // Correct answer

    // Error 1: Multiplied exponents -> (a/c)x^(k*n) + (b/c)x^(m*n)
    let err1_e1 = k * n;
    let err1_e2 = m * n;
    if (err1_e1 !== term1Exp || err1_e2 !== term2Exp) {
        let err1 = `${formatTerm(term1Coeff, variable, err1_e1)}${formatTerm(term2Coeff, variable, err1_e2, term1Coeff !== 0)}`;
        if (err1 !== cA && err1 !== "0") dSet.add(err1);
    }

    // Error 2: Only divided first term -> [(a/c)x^(k-n)] + bx^m
    let err2 = `${formatTerm(term1Coeff, variable, term1Exp)}${formatTerm(b, variable, m, term1Coeff !== 0)}`;
    if (err2 !== cA && err2 !== "0" && b !== 0) dSet.add(err2);

    // Error 3: Only divided coefficients, not exponents -> (a/c)x^k + (b/c)x^m
    let err3 = `${formatTerm(term1Coeff, variable, k)}${formatTerm(term2Coeff, variable, m, term1Coeff !== 0)}`;
    if (err3 !== cA && err3 !== "0") dSet.add(err3);

    // Error 4: Multiplied coefficients -> (ac)x^(k-n) + (bc)x^(m-n)
    let err4 = `${formatTerm(a * c, variable, term1Exp)}${formatTerm(b * c, variable, term2Exp, a * c !== 0)}`;
    if (err4 !== cA && err4 !== "0") dSet.add(err4);

    let fO = Array.from(dSet).filter(opt => opt !== '' && opt !== null);
    fO = fO.filter(opt => opt !== "0" || cA === "0");
    fO = Array.from(new Set(fO));

    // Fill logic
    let fillAttempts = 10;
    while (fO.length < 4 && fillAttempts > 0) {
        let rC1 = term1Coeff + (Math.floor(Math.random() * 3) - 1);
        let rC2 = term2Coeff + (Math.floor(Math.random() * 3) - 1);
        let rE1 = term1Exp + (Math.floor(Math.random() * 3) - 1);
        let rE2 = term2Exp + (Math.floor(Math.random() * 3) - 1);
        if (rE1 === 0) rE1 = 1; if (rE2 === 0) rE2 = 1; // Avoid constant terms if not intended
        if (rE1 === rE2) rE1++; // Avoid identical exponents
        
        let rO = `${formatTerm(rC1, variable, rE1)}${formatTerm(rC2, variable, rE2, rC1 !== 0)}`;
        if (rO === "") rO = "0";
        if (rO && !fO.includes(rO)) fO.push(rO);
        fillAttempts--;
    }
    
    // Trim logic
    while (fO.length > 4) {
        const i = Math.floor(Math.random() * fO.length);
        if (fO[i] !== cA) fO.splice(i, 1);
    }
    // Fallback fill
    while (fO.length < 4) {
        let fallback = `${formatTerm(term1Coeff + fO.length, variable, term1Exp + (fO.length % 2))}${formatTerm(term2Coeff + fO.length, variable, term2Exp - (fO.length % 2), true)}`;
        if (!fO.includes(fallback) && fallback !== cA && fallback !== "0") fO.push(fallback);
        else fO.push(`Option ${fO.length+1}`);
    }
    return fO.sort(() => Math.random() - 0.5);
}
/**
 * Distractor generator for Factoring Difference of Squares: (x^2 - a^2) / (x +/- a)
 * Result: (x -/+ a)
 */
function generateDistractors_FactorDifferenceOfSquares(correctResult, variable, a) {
    const { xCoeff, constant } = correctResult; // 1, and either +a or -a
    let cA = '';
    if (xCoeff !== 0) cA = formatTerm(xCoeff, variable, 1);
    if (constant !== 0) cA += formatConstant(constant, xCoeff !== 0);
    if (cA === "") cA = "0"; // Correct: "x + a" or "x - a"

    let dSet = new Set();
    dSet.add(cA);

    // Error 1: The other factor. (If correct is x+a, this is x-a)
    let err1_const = -constant;
    let err1 = `${formatTerm(xCoeff, variable, 1)}${formatConstant(err1_const, xCoeff !== 0)}`;
    if (err1 !== cA && err1 !== "0") dSet.add(err1);

    // Error 2: The unsimplified numerator (x^2 - a^2)
    let err2_const = -(a * a);
    let err2 = `${formatTerm(1, variable, 2)}${formatConstant(err2_const, true)}`;
    if (err2 !== cA && err2 !== "0") dSet.add(err2);

    // Error 3: The common (but wrong) "x^2 + a^2"
    let err3_const = (a * a);
    let err3 = `${formatTerm(1, variable, 2)}${formatConstant(err3_const, true)}`;
    if (err3 !== cA && err3 !== "0") dSet.add(err3);
    
    // Error 4: Just the variable
    let err4 = formatTerm(1, variable, 1);
    if (err4 !== cA && err4 !== "0") dSet.add(err4);

    let fO = Array.from(dSet).filter(opt => opt !== '' && opt !== null);
    fO = fO.filter(opt => opt !== "0" || cA === "0");
    fO = Array.from(new Set(fO));

    // Fill logic
    let fillAttempts = 10;
    while (fO.length < 4 && fillAttempts > 0) {
        let rC = constant + (Math.floor(Math.random() * 5) - 2);
        if (rC === constant || rC === -constant) { fillAttempts--; continue; } // Avoid correct/main error
        
        let rO = `${formatTerm(1, variable, 1)}${formatConstant(rC, true)}`;
        if (rO === "") rO = "0";
        if (rO && !fO.includes(rO)) fO.push(rO);
        fillAttempts--;
    }
    
    // Trim logic
    while (fO.length > 4) {
        const i = Math.floor(Math.random() * fO.length);
        if (fO[i] !== cA) fO.splice(i, 1);
    }
    // Fallback fill
    while (fO.length < 4) {
        let fallback = `${formatTerm(1, variable, 1)}${formatConstant(constant + fO.length, true)}`;
        if (!fO.includes(fallback)) fO.push(fallback);
        else fO.push(`Option ${fO.length+1}`);
    }
    return fO.sort(() => Math.random() - 0.5);
}
/**
 * Distractor generator for Factoring Perfect Square: (x^2 +/- 2ax + a^2) / (x +/- a)
 * Result: (x +/- a)
 */
function generateDistractors_FactorPerfectSquare(correctResult, variable, a) {
    const { xCoeff, constant } = correctResult; // 1, and either +a or -a
    let cA = '';
    if (xCoeff !== 0) cA = formatTerm(xCoeff, variable, 1);
    if (constant !== 0) cA += formatConstant(constant, xCoeff !== 0);
    if (cA === "") cA = "0"; // Correct: "x + a" or "x - a"

    let dSet = new Set();
    dSet.add(cA);

    // Error 1: The other factor. (If correct is x+a, this is x-a)
    let err1_const = -constant;
    let err1 = `${formatTerm(xCoeff, variable, 1)}${formatConstant(err1_const, xCoeff !== 0)}`;
    if (err1 !== cA && err1 !== "0") dSet.add(err1);

    // Error 2: The difference of squares factors (x^2 - a^2)
    let err2_const = -(a * a);
    let err2 = `${formatTerm(1, variable, 2)}${formatConstant(err2_const, true)}`;
    if (err2 !== cA && err2 !== "0") dSet.add(err2);

    // Error 3: The non-factored form of (x+a)^2
    let err3_const = (a * a);
    let err3_mid = 2 * a;
    let err3 = `${formatTerm(1, variable, 2)}${formatTerm(err3_mid, variable, 1, true)}${formatConstant(err3_const, true)}`;
    if (err3 !== cA && err3 !== "0" && constant < 0) dSet.add(err3); // Only show if not the numerator

    // Error 4: The non-factored form of (x-a)^2
    let err4_mid = -2 * a;
    let err4 = `${formatTerm(1, variable, 2)}${formatTerm(err4_mid, variable, 1, true)}${formatConstant(err3_const, true)}`;
    if (err4 !== cA && err4 !== "0" && constant > 0) dSet.add(err4); // Only show if not the numerator

    let fO = Array.from(dSet).filter(opt => opt !== '' && opt !== null);
    fO = fO.filter(opt => opt !== "0" || cA === "0");
    fO = Array.from(new Set(fO));

    // Fill logic
    let fillAttempts = 10;
    while (fO.length < 4 && fillAttempts > 0) {
        let rC = constant + (Math.floor(Math.random() * 5) - 2);
        if (rC === constant || rC === -constant) { fillAttempts--; continue; } // Avoid correct/main error
        
        let rO = `${formatTerm(1, variable, 1)}${formatConstant(rC, true)}`;
        if (rO === "") rO = "0";
        if (rO && !fO.includes(rO)) fO.push(rO);
        fillAttempts--;
    }
    
    // Trim logic
    while (fO.length > 4) {
        const i = Math.floor(Math.random() * fO.length);
        if (fO[i] !== cA) fO.splice(i, 1);
    }
    // Fallback fill
    while (fO.length < 4) {
        let fallback = `${formatTerm(1, variable, 1)}${formatConstant(constant + fO.length, true)}`;
        if (!fO.includes(fallback)) fO.push(fallback);
        else fO.push(`Option ${fO.length+1}`);
    }
    return fO.sort(() => Math.random() - 0.5);
}
/**
 * Distractor generator for Factoring Perfect Square w/ Coeff: (n(x^2 +/- 2ax + a^2)) / (x +/- a)
 * Result: n(x +/- a) = nx +/- na
 */
function generateDistractors_FactorPerfectSquareWithCoeff(correctResult, variable, n, a) {
    const { xCoeff, constant } = correctResult; // nx, and either +na or -na
    let cA = '';
    if (xCoeff !== 0) cA = formatTerm(xCoeff, variable, 1);
    if (constant !== 0) cA += formatConstant(constant, xCoeff !== 0);
    if (cA === "") cA = "0"; // Correct: "nx + na" or "nx - na"

    let dSet = new Set();
    dSet.add(cA);

    // Error 1: Forgot to multiply 'n' (the answer from Level 60)
    let err1_coeff = xCoeff / n;
    let err1_const = constant / n;
    let err1 = `${formatTerm(err1_coeff, variable, 1)}${formatConstant(err1_const, err1_coeff !== 0)}`;
    if (err1 !== cA && err1 !== "0") dSet.add(err1); // "x + a" or "x - a"

    // Error 2: The other sign -> nx -/+ na
    let err2 = `${formatTerm(xCoeff, variable, 1)}${formatConstant(-constant, xCoeff !== 0)}`;
    if (err2 !== cA && err2 !== "0") dSet.add(err2);

    // Error 3: Only multiplied 'n' on first term -> nx +/- a
    let err3 = `${formatTerm(xCoeff, variable, 1)}${formatConstant(err1_const, xCoeff !== 0)}`;
    if (err3 !== cA && err3 !== "0") dSet.add(err3);

    // Error 4: Only multiplied 'n' on second term -> x +/- na
    let err4 = `${formatTerm(err1_coeff, variable, 1)}${formatConstant(constant, err1_coeff !== 0)}`;
    if (err4 !== cA && err4 !== "0") dSet.add(err4);

    let fO = Array.from(dSet).filter(opt => opt !== '' && opt !== null);
    fO = fO.filter(opt => opt !== "0" || cA === "0");
    fO = Array.from(new Set(fO));

    // Fill logic
    let fillAttempts = 10;
    while (fO.length < 4 && fillAttempts > 0) {
        let rX = xCoeff + (Math.floor(Math.random() * 3) - 1);
        let rC = constant + (Math.floor(Math.random() * 5) - 2);
        if ((rX === xCoeff && rC === constant) || (rC === 0 && rX === 0)) { 
            fillAttempts--; continue; 
        }
        
        let rO = `${formatTerm(rX, variable, 1)}${formatConstant(rC, rX !== 0)}`;
        if (rO && !fO.includes(rO)) fO.push(rO);
        fillAttempts--;
    }
    
    // Trim logic
    while (fO.length > 4) {
        const i = Math.floor(Math.random() * fO.length);
        if (fO[i] !== cA) fO.splice(i, 1);
    }
    // Fallback fill
    while (fO.length < 4) {
        let fallback = `${formatTerm(xCoeff + fO.length, variable, 1)}${formatConstant(constant + fO.length, true)}`;
        if (!fO.includes(fallback)) fO.push(fallback);
        else fO.push(`Option ${fO.length+1}`);
    }
    return fO.sort(() => Math.random() - 0.5);
}
/**
 * Distractor generator for Factoring General Binomial: n(ax+b)(cx+d) / (ax+b)
 * Result: n(cx+d) = (nc)x + (nd)
 * Handles n=1 for Level 62.
 */
function generateDistractors_FactorGeneralBinomial(correctResult, variable, a, b, c, d, n) {
    const { xCoeff, constant } = correctResult; // nc, nd
    let cA = '';
    if (xCoeff !== 0) cA = formatTerm(xCoeff, variable, 1);
    if (constant !== 0) cA += formatConstant(constant, xCoeff !== 0);
    if (cA === "") cA = "0"; // Correct: "(nc)x + (nd)"

    let dSet = new Set();
    dSet.add(cA);

    // Error 1: The *other* factor (multiplied by n) -> n(ax+b)
    let err1_x = n * a;
    let err1_c = n * b;
    let err1 = `${formatTerm(err1_x, variable, 1)}${formatConstant(err1_c, err1_x !== 0)}`;
    if (err1 !== cA && err1 !== "0") dSet.add(err1);

    // Error 2: Forgot to multiply 'n' (the answer without n)
    if (n !== 1) {
        let err2_x = xCoeff / n;
        let err2_c = constant / n;
        let err2 = `${formatTerm(err2_x, variable, 1)}${formatConstant(err2_c, err2_x !== 0)}`;
        if (err2 !== cA && err2 !== "0") dSet.add(err2);
    }
    
    // Error 3: The *other* factor (without n) -> ax+b
    let err3 = `${formatTerm(a, variable, 1)}${formatConstant(b, a !== 0)}`;
    if (err3 !== cA && err3 !== "0" && n !== 1) dSet.add(err3);
    
    // Error 4: Sign error on correct answer -> (nc)x - (nd)
    let err4 = `${formatTerm(xCoeff, variable, 1)}${formatConstant(-constant, xCoeff !== 0)}`;
    if (err4 !== cA && err4 !== "0") dSet.add(err4);


    let fO = Array.from(dSet).filter(opt => opt !== '' && opt !== null);
    fO = fO.filter(opt => opt !== "0" || cA === "0");
    fO = Array.from(new Set(fO));

    // Fill logic
    let fillAttempts = 10;
    while (fO.length < 4 && fillAttempts > 0) {
        let rX = xCoeff + (Math.floor(Math.random() * 3) - 1) * n;
        let rC = constant + (Math.floor(Math.random() * 5) - 2) * n;
        if ((rX === xCoeff && rC === constant) || (rC === 0 && rX === 0)) { 
            fillAttempts--; continue; 
        }
        
        let rO = `${formatTerm(rX, variable, 1)}${formatConstant(rC, rX !== 0)}`;
        if (rO && !fO.includes(rO)) fO.push(rO);
        fillAttempts--;
    }
    
    // Trim logic
    while (fO.length > 4) {
        const i = Math.floor(Math.random() * fO.length);
        if (fO[i] !== cA) fO.splice(i, 1);
    }
    // Fallback fill
    while (fO.length < 4) {
        let fallback = `${formatTerm(xCoeff + fO.length, variable, 1)}${formatConstant(constant + fO.length, true)}`;
        if (!fO.includes(fallback)) fO.push(fallback);
        else fO.push(`Option ${fO.length+1}`);
    }
    return fO.sort(() => Math.random() - 0.5);
}

/**
 * Main function to generate questions.
 */
function generateQuestion(difficultyLevel, minAbsCoeff = 1, maxAbsCoeff = 10) {
    const var1 = 'x'; const var2 = 'y'; let question = '';
    let a, b, c, d, n, m, k; // Coefficients and exponents
    let correctResultNumeric; let correctResult;

    // Helper functions
    const getRandomCoeff = (neg=false, zero=false) => {let min=zero?0:minAbsCoeff; let c=Math.floor(Math.random()*(maxAbsCoeff-min+1))+min; if(neg&&Math.random()<0.5)c*=-1; if(!zero&&c===0)c=1; return c;};
    const getRandomExp = (minE=1, maxE=5) => Math.floor(Math.random()*(maxE-minE+1))+minE;

    switch (difficultyLevel) {
        // --- LEVELS 1-30 (Condensed) ---
        case 1: case 2: { a=getRandomCoeff(); b=getRandomCoeff(); question=`${formatTerm(a,var1,1)}${formatTerm(b,var1,1,true)}`; correctResultNumeric=a+b; let cA=formatTerm(correctResultNumeric,var1,1); return { question, correctAnswer: cA||"0", options: generateDistractors_Simple(cA||"0", correctResultNumeric,var1,minAbsCoeff,maxAbsCoeff)}; }
        case 3: case 4: { do {a=getRandomCoeff(); b=getRandomCoeff();} while(a<=b); question=`${formatTerm(a,var1,1)} - ${formatTerm(b,var1,1)}`; correctResultNumeric=a-b; let cA=formatTerm(correctResultNumeric,var1,1); return { question, correctAnswer: cA||"0", options: generateDistractors_Simple(cA||"0", correctResultNumeric,var1,minAbsCoeff,maxAbsCoeff)}; }
        case 5: case 6: { a=getRandomCoeff(); b=getRandomCoeff(); question=`${formatTerm(a,var1,1)} - ${formatTerm(b,var1,1)}`; correctResultNumeric=a-b; let cA=formatTerm(correctResultNumeric,var1,1); return { question, correctAnswer: cA||"0", options: generateDistractors_Simple(cA||"0", correctResultNumeric,var1,minAbsCoeff,maxAbsCoeff)}; }
        case 7: { a=getRandomCoeff(); b=getRandomCoeff(true); if(b>=0)b=-getRandomCoeff(); question=`${formatTerm(a,var1,1)}${formatTerm(b,var1,1,true)}`; correctResultNumeric=a+b; let cA=formatTerm(correctResultNumeric,var1,1); return { question, correctAnswer: cA||"0", options: generateDistractors_Simple(cA||"0", correctResultNumeric,var1,minAbsCoeff,maxAbsCoeff)}; }
        case 8: case 9: { a=getRandomCoeff(true); b=getRandomCoeff(true); question=`${formatTerm(a,var1,1)}${formatTerm(b,var1,1,true)}`; correctResultNumeric=a+b; let cA=formatTerm(correctResultNumeric,var1,1); return { question, correctAnswer: cA||"0", options: generateDistractors_Simple(cA||"0", correctResultNumeric,var1,minAbsCoeff,maxAbsCoeff)}; }
        case 10: { a=getRandomCoeff(); b=getRandomCoeff()*-1; question=`${formatTerm(a,var1,1)} + (${formatTerm(b,var1,1)})`; correctResultNumeric=a+b; let cA=formatTerm(correctResultNumeric,var1,1); return { question, correctAnswer: cA||"0", options: generateDistractors_Simple(cA||"0", correctResultNumeric,var1,minAbsCoeff,maxAbsCoeff)}; }
        case 11: case 12: { a=getRandomCoeff(true); b=getRandomCoeff(true); c=getRandomCoeff(true); question=`${formatTerm(a,var1,1)}${formatTerm(b,var1,1,true)}${formatTerm(c,var1,1,true)}`; correctResultNumeric=a+b+c; let cA=formatTerm(correctResultNumeric,var1,1); return { question, correctAnswer: cA||"0", options: generateDistractors_Simple(cA||"0", correctResultNumeric,var1,minAbsCoeff,maxAbsCoeff)}; }
        case 13: { a=getRandomCoeff(true); b=getRandomCoeff(true,true); c=getRandomCoeff(true); question=`${formatTerm(a,var1,1)}${formatConstant(b,true)}${formatTerm(c,var1,1,true)}`; correctResult={xCoeff:a+c, constant:b}; let cA=''; if(correctResult.xCoeff!==0)cA=formatTerm(correctResult.xCoeff,var1,1); if(correctResult.constant!==0)cA+=formatConstant(correctResult.constant, correctResult.xCoeff!==0); if(cA==="")cA="0"; return { question, correctAnswer: cA, options: generateDistractors_Compound(correctResult,var1)}; }
        case 14: { a=getRandomCoeff(true); b=getRandomCoeff(true,true); c=getRandomCoeff(true); d=getRandomCoeff(true,true); question=`${formatTerm(a,var1,1)}${formatConstant(b,true)}${formatTerm(c,var1,1,true)}${formatConstant(d,true)}`; correctResult={xCoeff:a+c, constant:b+d}; let cA=''; if(correctResult.xCoeff!==0)cA=formatTerm(correctResult.xCoeff,var1,1); if(correctResult.constant!==0)cA+=formatConstant(correctResult.constant, correctResult.xCoeff!==0); if(cA==="")cA="0"; return { question, correctAnswer: cA, options: generateDistractors_Compound(correctResult,var1)}; }
        case 15: { n=getRandomExp(2); a=getRandomCoeff(true); b=getRandomCoeff(true,true); c=getRandomCoeff(true); question=`${formatTerm(a,var1,n)}${formatConstant(b,true)}${formatTerm(c,var1,n,true)}`; correctResult={xCoeff:a+c, constant:b, xExp:n}; let cA=''; if(correctResult.xCoeff!==0)cA=formatTerm(correctResult.xCoeff,var1,correctResult.xExp); if(correctResult.constant!==0)cA+=formatConstant(correctResult.constant, correctResult.xCoeff!==0); if(cA==="")cA="0"; return { question, correctAnswer: cA, options: generateDistractors_ExponentWithConstant(correctResult,var1)}; }
        case 16: { n=getRandomExp(2); m=getRandomExp(2); if(n===m)m=n+1; a=getRandomCoeff(true); b=getRandomCoeff(true); c=getRandomCoeff(true); if(b===0)b=1; question=`${formatTerm(a,var1,n)}${formatTerm(b,var1,m,true)}${formatTerm(c,var1,n,true)}`; correctResult={term1Coeff:a+c, term2Coeff:b, term1Exp:n, term2Exp:m}; let cA=''; if(correctResult.term1Coeff!==0)cA=formatTerm(correctResult.term1Coeff,var1,correctResult.term1Exp); if(correctResult.term2Coeff!==0)cA+=formatTerm(correctResult.term2Coeff,var1,correctResult.term2Exp, correctResult.term1Coeff!==0); if(cA==="")cA="0"; return { question, correctAnswer: cA, options: generateDistractors_ExponentMultiTerm(correctResult,var1)}; }
        case 17: { a=getRandomCoeff(true); b=getRandomCoeff(true); c=getRandomCoeff(true); d=getRandomCoeff(true); if(b===0&&d===0)b=1; question=`${formatTerm(a,var1,1)}${formatTerm(b,var2,1,true)}${formatTerm(c,var1,1,true)}${formatTerm(d,var2,1,true)}`; correctResult={xCoeff:a+c, yCoeff:b+d}; let cA=''; if(correctResult.xCoeff!==0)cA=formatTerm(correctResult.xCoeff,var1,1); if(correctResult.yCoeff!==0)cA+=formatTerm(correctResult.yCoeff,var2,1, correctResult.xCoeff!==0); if(cA==="")cA="0"; return { question, correctAnswer: cA, options: generateDistractors_MultiVariable(correctResult,var1,var2)}; }
        case 18: { n=getRandomExp(2); a=getRandomCoeff(true); b=getRandomCoeff(true); c=getRandomCoeff(true); d=getRandomCoeff(true); if(b===0&&d===0)b=1; question=`${formatTerm(a,var1,n)}${formatTerm(b,var2,1,true)}${formatTerm(c,var1,n,true)}${formatTerm(d,var2,1,true)}`; correctResult={xCoeff:a+c, yCoeff:b+d, xExp:n}; let cA=''; if(correctResult.xCoeff!==0)cA=formatTerm(correctResult.xCoeff,var1,correctResult.xExp); if(correctResult.yCoeff!==0)cA+=formatTerm(correctResult.yCoeff,var2,1, correctResult.xCoeff!==0); if(cA==="")cA="0"; return { question, correctAnswer: cA, options: generateDistractors_ExponentSingleVariable(correctResult,var1,var2)}; }
        case 19: { n=getRandomExp(2); m=getRandomExp(2); if(n===m)m=n+1; a=getRandomCoeff(true); b=getRandomCoeff(true); c=getRandomCoeff(true); d=getRandomCoeff(true); if(b===0&&d===0)b=1; question=`${formatTerm(a,var1,n)}${formatTerm(b,var2,m,true)}${formatTerm(c,var1,n,true)}${formatTerm(d,var2,m,true)}`; correctResult={xCoeff:a+c, yCoeff:b+d, xExp:n, yExp:m}; let cA=''; if(correctResult.xCoeff!==0)cA=formatTerm(correctResult.xCoeff,var1,correctResult.xExp); if(correctResult.yCoeff!==0)cA+=formatTerm(correctResult.yCoeff,var2,correctResult.yExp, correctResult.xCoeff!==0); if(cA==="")cA="0"; return { question, correctAnswer: cA, options: generateDistractors_ExponentMultiVariable(correctResult,var1,var2)}; }
        case 20: { a=getRandomCoeff(); b=getRandomCoeff(); question=`${a} &times; ${formatTerm(b,var1,1)}`; correctResult={coeff:a*b, exp:1}; let cA=formatTerm(correctResult.coeff,var1,correctResult.exp); return { question, correctAnswer: cA||"0", options:generateDistractors_Multiplication(correctResult,var1,difficultyLevel,1,1)}; }
        case 21: { a=getRandomCoeff(true); b=getRandomCoeff(true); let bT=formatTerm(b,var1,1); question=`${a} &times; `+(b<0?`(${bT})`:bT); correctResult={coeff:a*b, exp:1}; let cA=formatTerm(correctResult.coeff,var1,correctResult.exp); if(cA==="")cA="0"; return { question, correctAnswer: cA, options:generateDistractors_Multiplication(correctResult,var1,difficultyLevel,1,1)}; }
        case 22: { a=getRandomCoeff(); b=getRandomCoeff(); n=getRandomExp(2,4); question=`${formatTerm(a,var1,1)} &times; ${formatTerm(b,var1,n)}`; correctResult={coeff:a*b, exp:1+n}; let cA=formatTerm(correctResult.coeff,var1,correctResult.exp); return { question, correctAnswer: cA||"0", options:generateDistractors_Multiplication(correctResult,var1,difficultyLevel,1,n)}; }
        case 23: { n=getRandomExp(2,5); m=getRandomExp(2,5); question=`${formatTerm(1,var1,n)} &times; ${formatTerm(1,var1,m)}`; correctResult={coeff:1, exp:n+m}; let cA=formatTerm(correctResult.coeff,var1,correctResult.exp); return { question, correctAnswer: cA||"0", options:generateDistractors_Multiplication(correctResult,var1,difficultyLevel,n,m)}; }
        case 24: { a=getRandomCoeff(); b=getRandomCoeff(); n=getRandomExp(2,5); m=getRandomExp(2,5); question=`${formatTerm(a,var1,n)} &times; ${formatTerm(b,var1,m)}`; correctResult={coeff:a*b, exp:n+m}; let cA=formatTerm(correctResult.coeff,var1,correctResult.exp); return { question, correctAnswer: cA||"0", options:generateDistractors_Multiplication(correctResult,var1,difficultyLevel,n,m)}; }
        case 25: { a=getRandomCoeff(true); b=getRandomCoeff(true); n=getRandomExp(2,5); m=getRandomExp(2,5); let tA=formatTerm(a,var1,n); let tB=formatTerm(b,var1,m); question=(a<0?`(${tA})`:tA)+` &times; `+(b<0?`(${tB})`:tB); correctResult={coeff:a*b, exp:n+m}; let cA=formatTerm(correctResult.coeff,var1,correctResult.exp); if(cA==="")cA="0"; return { question, correctAnswer: cA, options:generateDistractors_Multiplication(correctResult,var1,difficultyLevel,n,m)}; }
        case 26: { let rC=getRandomCoeff(false,false,Math.floor(maxAbsCoeff/2)); b=getRandomCoeff(); a=rC*b; if(a===0){a=b;rC=1;} question=formatFractionHTML(formatTerm(a,var1,1),formatConstant(b)); correctResult={coeff:rC, exp:1}; let cA=formatTerm(correctResult.coeff,var1,correctResult.exp); return { question, correctAnswer: cA||"0", options:generateDistractors_Division(correctResult,var1,difficultyLevel)}; }
        case 27: { let rC=getRandomCoeff(true,false,Math.floor(maxAbsCoeff/2)); b=getRandomCoeff(true); if(b===0)b=1; a=rC*b; if(a===0&&rC!==0){a=b;rC=1;} if(a===0&&rC===0){a=0;} question=formatFractionHTML(formatTerm(a,var1,1),formatConstant(b)); correctResult={coeff:rC, exp:1}; let cA=formatTerm(correctResult.coeff,var1,correctResult.exp); return { question, correctAnswer: cA||"0", options:generateDistractors_Division(correctResult,var1,difficultyLevel)}; }
        case 28: { n=getRandomExp(1,6); m=getRandomExp(1,6); let rC=getRandomCoeff(true,false,Math.floor(maxAbsCoeff/2)); b=getRandomCoeff(true); if(b===0)b=1; a=rC*b; if(a===0&&rC!==0){a=b;rC=1;} if(a===0&&rC===0){a=0;} let num=formatTerm(a,var1,n); let den=formatTerm(b,var1,m); if(num==="")num="0"; if(den==="")den="1"; question=formatFractionHTML(num,den); correctResult={coeff:rC, exp:n-m}; let cA=formatTerm(correctResult.coeff,var1,correctResult.exp); return { question, correctAnswer: cA||"0", options:generateDistractors_Division(correctResult,var1,difficultyLevel)}; }
        case 29: { do{n=getRandomExp(1,5); m=getRandomExp(2,6);}while(n>=m); let rC=getRandomCoeff(true,false,Math.floor(maxAbsCoeff/2)); b=getRandomCoeff(true); if(b===0)b=1; a=rC*b; if(a===0&&rC!==0){a=b;rC=1;} if(a===0&&rC===0){a=0;} let num=formatTerm(a,var1,n); let den=formatTerm(b,var1,m); if(num==="")num="0"; if(den==="")den="1"; question=formatFractionHTML(num,den); correctResult={coeff:rC, exp:n-m}; let cA=formatTerm(correctResult.coeff,var1,correctResult.exp); return { question, correctAnswer: cA||"0", options:generateDistractors_Division(correctResult,var1,difficultyLevel)}; }
        case 30: { do{n=getRandomExp(1,5); m=getRandomExp(2,6);}while(n>=m); let rC=getRandomCoeff(true,false,Math.floor(maxAbsCoeff/2)); b=getRandomCoeff(true); if(b===0)b=1; a=rC*b; if(a===0&&rC!==0){a=b;rC=1;} if(a===0&&rC===0){a=0;} let num=formatTerm(a,var1,n); let den=formatTerm(b,var1,m); if(num==="")num="0"; if(den==="")den="1"; question=formatFractionHTML(num,den); correctResult={coeff:rC, exp:n-m}; let cA=formatFractionHTML(formatConstant(correctResult.coeff),formatTerm(1,var1,-correctResult.exp)); if(correctResult.coeff===0)cA="0"; return { question, correctAnswer: cA, options:generateDistractors_Division(correctResult,var1,difficultyLevel)}; }

        // --- LEVELS 31-37 (With new level 31 and renumbering) ---
        case 31: { // (x^n)^m
            n = getRandomExp(2, 5); m = getRandomExp(2, 4);
            let resExp = n * m; question = `(${formatTerm(1, var1, n)})<sup>${m}</sup>`;
            correctResult = { coeff: 1, exp: resExp };
            let cA = formatTerm(correctResult.coeff, var1, correctResult.exp);
            return { question, correctAnswer: cA || "0", options: generateDistractors_PowerBase1(correctResult, var1, n, m) };
        }
        case 32:   // (ax^n)^m (a > 0)
        case 33:   // (ax^n)^m (a < 0)
        case 34: { // (ax^n)^m (All a)
            n = getRandomExp(1, 4); m = getRandomExp(2, 3);
            let allowNegativeA = (difficultyLevel === 33 || difficultyLevel === 34);
            a = getRandomCoeff(allowNegativeA);
            if(difficultyLevel === 33 && a > 0) a *= -1; // Ensure 'a' is negative for level 33
            let resCoeff = Math.round(Math.pow(a, m)); let resExp = n * m;
            let baseTerm = formatTerm(a, var1, n); question = `(${baseTerm})<sup>${m}</sup>`;
            correctResult = { coeff: resCoeff, exp: resExp };
            let cA = formatTerm(correctResult.coeff, var1, correctResult.exp);
            return { question, correctAnswer: cA || "0", options: generateDistractors_Power(correctResult, var1, a, n, m) };
        }
        case 35: { // x^n * x^m / x^k
            do { n = getRandomExp(2, 6); m = getRandomExp(2, 6); k = getRandomExp(1, n + m -1); } while (n + m - k <= 0);
            question = formatFractionHTML( `${formatTerm(1, var1, n)} &times; ${formatTerm(1, var1, m)}`, formatTerm(1, var1, k) );
            correctResult = { coeff: 1, exp: n + m - k };
            let cA = formatTerm(correctResult.coeff, var1, correctResult.exp);
            return { question, correctAnswer: cA || "0", options: generateDistractors_CombinedOps(correctResult, var1, n, m, k) };
        }
        case 36:   // ax^n * bx^m / cx^k (a,b,c > 0)
        case 37: { // ax^n * bx^m / cx^k (a,b,c neg)
            let allowNegative = (difficultyLevel === 37); let resCoeff; let attempts = 0;
            do {
                attempts++; if (attempts > 100) { console.error(`Failsafe level ${difficultyLevel}`); return generateQuestion(1); }
                resCoeff = getRandomCoeff(allowNegative, false, Math.floor(maxAbsCoeff / 2));
                c = getRandomCoeff(allowNegative, false);
                a = getRandomCoeff(allowNegative, false); if (a === 0) continue;
                let numProd = resCoeff * c; if (numProd % a !== 0) continue;
                b = numProd / a;
                if (!Number.isInteger(b) || (b === 0 && resCoeff !== 0) || Math.abs(b) > maxAbsCoeff * 3 || Math.abs(b) < minAbsCoeff ) continue;
                do { n = getRandomExp(1, 5); m = getRandomExp(1, 5); k = getRandomExp(0, n + m); } while (n + m - k <= 0); // Ensure result exp > 0
                break;
            } while (true);
            if (!allowNegative) { a=Math.abs(a); b=Math.abs(b); c=Math.abs(c); resCoeff=Math.abs(resCoeff); if(a===0)a=1; if(b===0)b=1; if(c===0)c=1; if(resCoeff===0)resCoeff=1; }
            let numT1=formatTerm(a,var1,n); let numT2=formatTerm(b,var1,m); let denT=formatTerm(c,var1,k); if(denT===""||denT==="+"||denT==="-")denT=formatConstant(c);
            question = formatFractionHTML( `${(a<0?`(${numT1})`:numT1)} &times; ${(b<0?`(${numT2})`:numT2)}`, (c<0?`(${denT})`:denT) );
            correctResult = { coeff: resCoeff, exp: n + m - k };
            let cA = formatTerm(correctResult.coeff, var1, correctResult.exp);
            return { question, correctAnswer: cA || "0", options: generateDistractors_CombinedOps(correctResult, var1, n, m, k) };
        } // End case 36-37
		case 38: { // a(bx + c) (a, b, c > 0) [Source 39]
            a = getRandomCoeff(false); // a > 0
            b = getRandomCoeff(false); // b > 0
            c = getRandomCoeff(false); // c > 0
            
            // Format question: a(bx + c)
            question = `${a}(${formatTerm(b, var1, 1)}${formatConstant(c, true)})`;
            
            // Calculate correct answer
            correctResult = { xCoeff: a * b, constant: a * c };
            
            // Format correct answer string: (a*b)x + (a*c)
            let cA = '';
            if (correctResult.xCoeff !== 0) cA = formatTerm(correctResult.xCoeff, var1, 1);
            if (correctResult.constant !== 0) cA += formatConstant(correctResult.constant, correctResult.xCoeff !== 0);
            if (cA === "") cA = "0";
            
            return { 
                question, 
                correctAnswer: cA, 
                options: generateDistractors_Distributive(correctResult, var1, a, b, c) 
            };
        }
        
        // Stub out the next levels so they default to 38 for now
        case 39: { 
            a = getRandomCoeff(false); // a > 0
            
            // Ensure b or c is negative
            do {
                b = getRandomCoeff(true); // b can be < 0
                c = getRandomCoeff(true); // c can be < 0
            } while (b > 0 && c > 0); // Loop until at least one is negative
            
            // Format question: a(bx + c)
            // Need to handle "bx - c" formatting nicely
            let innerTerm = `${formatTerm(b, var1, 1)}${formatConstant(c, true)}`;
            question = `${a}(${innerTerm})`;
            
            // Calculate correct answer
            correctResult = { xCoeff: a * b, constant: a * c };
            
            // Format correct answer string: (a*b)x + (a*c)
            let cA = '';
            if (correctResult.xCoeff !== 0) cA = formatTerm(correctResult.xCoeff, var1, 1);
            if (correctResult.constant !== 0) cA += formatConstant(correctResult.constant, correctResult.xCoeff !== 0);
            if (cA === "") cA = "0";
            
            return { 
                question, 
                correctAnswer: cA, 
                // We can reuse the same distractor logic as Level 38
                options: generateDistractors_Distributive(correctResult, var1, a, b, c) 
            };
        }
		case 40: { 
            // a, b, c can all be negative
            // The (minCoeff = 2) from app.js ensures a is not 1 or -1
            a = getRandomCoeff(true); 
            
            // Ensure at least one coefficient is negative
            do {
                b = getRandomCoeff(true); // b can be < 0
                c = getRandomCoeff(true); // c can be < 0
            } while (a > 0 && b > 0 && c > 0); // Loop until at least one is negative
            
            // Format question: a(bx + c)
            let innerTerm = `${formatTerm(b, var1, 1)}${formatConstant(c, true)}`;
            let aTerm = (a < 0) ? `(${a})` : a; // Put ( ) around negative 'a'
            question = `${aTerm}(${innerTerm})`;
            
            // Calculate correct answer
            correctResult = { xCoeff: a * b, constant: a * c };
            
            // Format correct answer string: (a*b)x + (a*c)
            let cA = '';
            if (correctResult.xCoeff !== 0) cA = formatTerm(correctResult.xCoeff, var1, 1);
            if (correctResult.constant !== 0) cA += formatConstant(correctResult.constant, correctResult.xCoeff !== 0);
            if (cA === "") cA = "0";
            
            return { 
                question, 
                correctAnswer: cA, 
                // We can still use the same distractor logic
                options: generateDistractors_Distributive(correctResult, var1, a, b, c) 
            };
        }
		// [Source 47]: ax(bx + c) (c can be < 0)
		case 41: {
            // 'a' can be negative, but let's keep it positive for this level
            // to isolate the new skill (distributing 'x').
            // The user remark "a should never been 1" applies here too.
            // minCoeff=2 from app.js will handle this.
            a = getRandomCoeff(false); // a > 0, a != 1
            b = getRandomCoeff(true);  // b can be < 0
            
            // Ensure c is negative
            c = getRandomCoeff(true);
            if (c > 0) c *= -1; 
            
            // Format question: ax(bx + c)
            let aTerm = formatTerm(a, var1, 1);
            let innerTerm = `${formatTerm(b, var1, 1)}${formatConstant(c, true)}`;
            question = `${aTerm}(${innerTerm})`;
            
            // Calculate correct answer
            correctResult = {
                term1Coeff: a * b, term1Exp: 2, // (a*b)x^2
                term2Coeff: a * c, term2Exp: 1  // (a*c)x
            };
            
            // Format correct answer string: (ab)x^2 + (ac)x
            let cA = '';
            if (correctResult.term1Coeff !== 0) cA = formatTerm(correctResult.term1Coeff, var1, correctResult.term1Exp);
            if (correctResult.term2Coeff !== 0) cA += formatTerm(correctResult.term2Coeff, var1, correctResult.term2Exp, correctResult.term1Coeff !== 0);
            if (cA === "") cA = "0";
            
            return { 
                question, 
                correctAnswer: cA, 
                options: generateDistractors_DistributiveVar(correctResult, var1, a, b, c) 
            };
        }
		// [Source 70]: ax^n(bx^m + c) (c can be < 0)
        case 42: {
            // 'a' can be negative, minCoeff=2 from app.js ensures a != 1, -1
            a = getRandomCoeff(true);
            n = getRandomExp(2, 5); // n > 1
            b = getRandomCoeff(true); // b can be < 0
            m = getRandomExp(1, 4); // m >= 1
            
            // c can be negative 
            c = getRandomCoeff(true); 
            
            // Format question: ax^n(bx^m + c)
            let aTerm = formatTerm(a, var1, n);
            let innerTerm = `${formatTerm(b, var1, m)}${formatConstant(c, true)}`;
            question = `${aTerm}(${innerTerm})`;
            
            // Calculate correct answer
            correctResult = {
                term1Coeff: a * b, term1Exp: n + m, // (a*b)x^(n+m)
                term2Coeff: a * c, term2Exp: n      // (a*c)x^n
            };
            
            // Format correct answer string
            let cA = '';
            if (correctResult.term1Coeff !== 0) cA = formatTerm(correctResult.term1Coeff, var1, correctResult.term1Exp);
            if (correctResult.term2Coeff !== 0) cA += formatTerm(correctResult.term2Coeff, var1, correctResult.term2Exp, correctResult.term1Coeff !== 0);
            if (cA === "") cA = "0";
            
            return { 
                question, 
                correctAnswer: cA, 
                options: generateDistractors_DistributiveVarExponent(correctResult, var1, a, n, b, m, c) 
            };
        }
		// ... after the closing brace } for case 42

        // User Level 43: ax^n(bx^m + cx^p) (a, b, c can be < 0)
        // User Level 43: ax^n(bx^m + cx) (a, b, c can be < 0)
        // This is the case where p=1
        case 43: {
            // a, b, c can be negative. minCoeff=2 ensures a != 1, -1
            a = getRandomCoeff(true);
            n = getRandomExp(2, 4); // n >= 2
            b = getRandomCoeff(true);
            
            // Ensure m is not 1, so the terms are different
            do {
                m = getRandomExp(1, 3);
            } while (m === 1); 
            
            c = getRandomCoeff(true);
            const p = 1; // This is the key for this level
            
            // Format question: ax^n(bx^m + cx)
            let aTerm = formatTerm(a, var1, n);
            let innerTerm = `${formatTerm(b, var1, m)}${formatTerm(c, var1, p, true)}`;
            question = `${aTerm}(${innerTerm})`;
            
            // Calculate correct answer
            let resExp1 = n + m;
            let resExp2 = n + p; // n + 1
            
            // Ensure resulting terms are in a consistent (descending) order
            correctResult = {
                term1Coeff: (resExp1 > resExp2) ? (a * b) : (a * c),
                term1Exp:   (resExp1 > resExp2) ? resExp1 : resExp2,
                term2Coeff: (resExp1 > resExp2) ? (a * c) : (a * b),
                term2Exp:   (resExp1 > resExp2) ? resExp2 : resExp1
            };
            
            // Format correct answer string
            let cA = '';
            if (correctResult.term1Coeff !== 0) cA = formatTerm(correctResult.term1Coeff, var1, correctResult.term1Exp);
            if (correctResult.term2Coeff !== 0) cA += formatTerm(correctResult.term2Coeff, var1, correctResult.term2Exp, correctResult.term1Coeff !== 0);
            if (cA === "") cA = "0";
            
            return { 
                question, 
                correctAnswer: cA, 
                // We reuse the same advanced distractor function
                options: generateDistractors_DistributiveMultiVarExponent(correctResult, var1, a, n, b, m, c, p) 
            };
        }

        // User Level 44: ax^n(bx^m + cx^p) (a, b, c can be < 0)
        // This is the case we previously called Level 43
        case 44: {
            // a, b, c can be negative. minCoeff=2 ensures a != 1, -1
            a = getRandomCoeff(true);
            n = getRandomExp(2, 4); // n >= 2
            b = getRandomCoeff(true);
            m = getRandomExp(2, 4);
			p = getRandomExp(1, m - 1); // p will be 1 (if m=2) or 1-3 (if m=4)
            c = getRandomCoeff(true);
                        
            // Format question: ax^n(bx^m + cx^p)
            let aTerm = formatTerm(a, var1, n);
            let innerTerm = `${formatTerm(b, var1, m)}${formatTerm(c, var1, p, true)}`;
            question = `${aTerm}(${innerTerm})`;
            
            // Calculate correct answer
            let resExp1 = n + m;
            let resExp2 = n + p;
            
            // Ensure resulting terms are in a consistent (descending) order
            correctResult = {
                term1Coeff: (resExp1 > resExp2) ? (a * b) : (a * c),
                term1Exp:   (resExp1 > resExp2) ? resExp1 : resExp2,
                term2Coeff: (resExp1 > resExp2) ? (a * c) : (a * b),
                term2Exp:   (resExp1 > resExp2) ? resExp2 : resExp1
            };
            
            // Format correct answer string
            let cA = '';
            if (correctResult.term1Coeff !== 0) cA = formatTerm(correctResult.term1Coeff, var1, correctResult.term1Exp);
            if (correctResult.term2Coeff !== 0) cA += formatTerm(correctResult.term2Coeff, var1, correctResult.term2Exp, correctResult.term1Coeff !== 0);
            if (cA === "") cA = "0";
            
            return { 
                question, 
                correctAnswer: cA, 
                options: generateDistractors_DistributiveMultiVarExponent(correctResult, var1, a, n, b, m, c, p) 
            };
        }
		// [Source 50]: x^n * y^m * x^k (Now Level 45)
        case 45: {
            n = getRandomExp(1, 4);
            m = getRandomExp(1, 4);
            k = getRandomExp(1, 4);
            
            // Format question: x^n * y^m * x^k
            question = `${formatTerm(1, var1, n)} &times; ${formatTerm(1, var2, m)} &times; ${formatTerm(1, var1, k)}`;
            
            // Calculate correct answer
            correctResult = {
                xCoeff: 1, yCoeff: 1,
                xExp: n + k,
                yExp: m
            };
            
            // Format correct answer string: x^(n+k)y^m
            let cA = `${formatTerm(correctResult.xCoeff, var1, correctResult.xExp)}${formatTerm(correctResult.yCoeff, var2, correctResult.yExp)}`;
            if (cA === "") cA = "0";
            
            return { 
                question, 
                correctAnswer: cA, 
                options: generateDistractors_MultiVarMultiply(correctResult, var1, var2, n, m, k) 
            };
        }
	// [Source 75]: ax^n * by^m * cx^k (a, b, c > 0) (Now Level 46)
        case 46: {
            // a, b, c > 0
            a = getRandomCoeff(false);
            b = getRandomCoeff(false);
            c = getRandomCoeff(false);

            n = getRandomExp(1, 4);
            m = getRandomExp(1, 4);
            k = getRandomExp(1, 4);
            
            // Format question: ax^n * by^m * cx^k
            question = `${formatTerm(a, var1, n)} &times; ${formatTerm(b, var2, m)} &times; ${formatTerm(c, var1, k)}`;
            
            // Calculate correct answer
            correctResult = {
                xCoeff: a * b * c, // All coeffs multiplied
                yCoeff: 1,         // y coeff is 1 (lumped into xCoeff)
                xExp: n + k,
                yExp: m
            };
            
            // Format correct answer string: (abc)x^(n+k)y^m
            let cA = `${formatTerm(correctResult.xCoeff, var1, correctResult.xExp)}${formatTerm(correctResult.yCoeff, var2, correctResult.yExp)}`;
            if (cA === "") cA = "0";
            
            return { 
                question, 
                correctAnswer: cA, 
                options: generateDistractors_MultiVarMultiplyCoeff(correctResult, var1, var2, a, b, c, n, m, k) 
            };
        }
		// [Source 76]: ax^n * by^m * cx^k (a, b, c can be < 0) (Now Level 47)
        case 47: {
            // a, b, c can be < 0
            a = getRandomCoeff(true);
            b = getRandomCoeff(true);
            c = getRandomCoeff(true);

            n = getRandomExp(1, 4);
            m = getRandomExp(1, 4);
            k = getRandomExp(1, 4);
            
            // Format question: ax^n * by^m * cx^k (with parentheses for negatives)
            let termA = formatTerm(a, var1, n);
            let termB = formatTerm(b, var2, m);
            let termC = formatTerm(c, var1, k);

            question = `${(a < 0 ? `(${termA})` : termA)} &times; ${(b < 0 ? `(${termB})` : termB)} &times; ${(c < 0 ? `(${termC})` : termC)}`;
            
            // Calculate correct answer
            correctResult = {
                xCoeff: a * b * c, // All coeffs multiplied
                yCoeff: 1,         // y coeff is 1 (lumped into xCoeff)
                xExp: n + k,
                yExp: m
            };
            
            // Format correct answer string: (abc)x^(n+k)y^m
            let cA = `${formatTerm(correctResult.xCoeff, var1, correctResult.xExp)}${formatTerm(correctResult.yCoeff, var2, correctResult.yExp)}`;
            if (cA === "") cA = "0";
            
            return { 
                question, 
                correctAnswer: cA, 
                // The distractor function we just updated will handle this
                options: generateDistractors_MultiVarMultiplyCoeff(correctResult, var1, var2, a, b, c, n, m, k) 
            };
        }
		// [Source 55]: (x + a)(x - a) (Difference of squares) (Now Level 48)
        case 48: {
            // a > 0. minCoeff=2 from app.js ensures a != 1.
            a = getRandomCoeff(false); 
            
            // Format question: (x + a)(x - a)
            let term1 = `(${var1}${formatConstant(a, true)})`; // (x + a)
            let term2 = `(${var1}${formatConstant(-a, true)})`; // (x - a)
            
            // Randomly swap order
            question = (Math.random() < 0.5) ? `${term1}${term2}` : `${term2}${term1}`;

            
            // Calculate correct answer: x^2 - a^2
            correctResult = {
                term1Coeff: 1,
                term1Exp: 2,
                term2Coeff: 0, // No x term
                term2Exp: 1,
                constant: -(a * a)
            };
            
            // Format correct answer string: x^2 - a^2
            let cA = '';
            if (correctResult.term1Coeff !== 0) cA = formatTerm(correctResult.term1Coeff, var1, correctResult.term1Exp);
            if (correctResult.constant !== 0) cA += formatConstant(correctResult.constant, correctResult.term1Coeff !== 0);
            if (cA === "") cA = "0";
            
            return { 
                question, 
                correctAnswer: cA, 
                options: generateDistractors_DifferenceOfSquares(correctResult, var1, a) 
            };
        }
		// [Source 56]: (x + a)^2 (Square of a sum) (Now Level 49)
        case 49: {
            // a > 0. minCoeff=2 from app.js ensures a != 1.
            a = getRandomCoeff(false); 
            
            // Format question: (x + a)^2
            question = `(${var1}${formatConstant(a, true)})<sup>2</sup>`;
            
            // Calculate correct answer: x^2 + 2ax + a^2
            correctResult = {
                term1Coeff: 1,     term1Exp: 2,
                term2Coeff: 2 * a, term2Exp: 1,
                constant: a * a
            };
            
            // Format correct answer string
            let cA = '';
            if (correctResult.term1Coeff !== 0) cA = formatTerm(correctResult.term1Coeff, var1, correctResult.term1Exp);
            if (correctResult.term2Coeff !== 0) cA += formatTerm(correctResult.term2Coeff, var1, correctResult.term2Exp, true);
            if (correctResult.constant !== 0) cA += formatConstant(correctResult.constant, true);
            if (cA === "") cA = "0";
            
            return { 
                question, 
                correctAnswer: cA, 
                options: generateDistractors_PerfectSquare(correctResult, var1, a) 
            };
        }

        // [Source 57]: (x - a)^2 (Square of a difference) (Now Level 50)
        case 50: {
            // a > 0. minCoeff=2 from app.js ensures a != 1.
            a = getRandomCoeff(false); 
            
            // Format question: (x - a)^2
            question = `(${var1}${formatConstant(-a, true)})<sup>2</sup>`;
            
            // Calculate correct answer: x^2 - 2ax + a^2
            correctResult = {
                term1Coeff: 1,      term1Exp: 2,
                term2Coeff: -2 * a, term2Exp: 1,
                constant: a * a
            };
            
            // Format correct answer string
            let cA = '';
            if (correctResult.term1Coeff !== 0) cA = formatTerm(correctResult.term1Coeff, var1, correctResult.term1Exp);
            if (correctResult.term2Coeff !== 0) cA += formatTerm(correctResult.term2Coeff, var1, correctResult.term2Exp, true);
            if (correctResult.constant !== 0) cA += formatConstant(correctResult.constant, true);
            if (cA === "") cA = "0";
            
            return { 
                question, 
                correctAnswer: cA, 
                options: generateDistractors_PerfectSquare(correctResult, var1, a) 
            };
        }
		// [Source 80]: (x + a)^2 or (x - a)^2 (Now Level 51)
        case 51: {
            // a > 0. minCoeff=2 from app.js ensures a != 1.
            a = getRandomCoeff(false); 
            
            if (Math.random() < 0.5) {
                // --- (x + a)^2 case (from Level 49) --- 
                question = `(${var1}${formatConstant(a, true)})<sup>2</sup>`;
                correctResult = {
                    term1Coeff: 1,     term1Exp: 2,
                    term2Coeff: 2 * a, term2Exp: 1,
                    constant: a * a
                };
            } else {
                // --- (x - a)^2 case (from Level 50) --- 
                question = `(${var1}${formatConstant(-a, true)})<sup>2</sup>`;
                correctResult = {
                    term1Coeff: 1,      term1Exp: 2,
                    term2Coeff: -2 * a, term2Exp: 1,
                    constant: a * a
                };
            }
            
            // Format correct answer string (works for both)
            let cA = '';
            if (correctResult.term1Coeff !== 0) cA = formatTerm(correctResult.term1Coeff, var1, correctResult.term1Exp);
            if (correctResult.term2Coeff !== 0) cA += formatTerm(correctResult.term2Coeff, var1, correctResult.term2Exp, true);
            if (correctResult.constant !== 0) cA += formatConstant(correctResult.constant, true);
            if (cA === "") cA = "0";
            
            return { 
                question, 
                correctAnswer: cA, 
                // The existing distractor function handles both cases perfectly
                options: generateDistractors_PerfectSquare(correctResult, var1, a) 
            };
        }
		// [Source 59]: (ax + b)(ax - b) (Now Level 52)
        case 52: {
            // a, b > 0. minCoeff=2 from app.js ensures a, b != 1.
            a = getRandomCoeff(false); 
            b = getRandomCoeff(false);
            
            // Format question: (ax + b)(ax - b)
            let termA = formatTerm(a, var1, 1);
            let term1 = `(${termA}${formatConstant(b, true)})`; // (ax + b)
            let term2 = `(${termA}${formatConstant(-b, true)})`; // (ax - b)
            
            // Randomly swap order
            question = (Math.random() < 0.5) ? `${term1}${term2}` : `${term2}${term1}`;
            
            // Calculate correct answer: a^2x^2 - b^2
            correctResult = {
                term1Coeff: a * a,
                term1Exp: 2,
                constant: -(b * b)
            };
            
            // Format correct answer string: a^2x^2 - b^2
            let cA = '';
            if (correctResult.term1Coeff !== 0) cA = formatTerm(correctResult.term1Coeff, var1, correctResult.term1Exp);
            if (correctResult.constant !== 0) cA += formatConstant(correctResult.constant, correctResult.term1Coeff !== 0);
            if (cA === "") cA = "0";
            
            return { 
                question, 
                correctAnswer: cA, 
                options: generateDistractors_DifferenceOfSquaresCoeff(correctResult, var1, a, b) 
            };
        }
		// [Source 60]: (ax + b)^2 (Now Level 53)
        case 53: {
            // a, b > 0. minCoeff=2 from app.js ensures a, b != 1.
            a = getRandomCoeff(false); 
            b = getRandomCoeff(false);
            
            // Format question: (ax + b)^2
            question = `(${formatTerm(a, var1, 1)}${formatConstant(b, true)})<sup>2</sup>`;
            
            // Calculate correct answer: a^2x^2 + 2abx + b^2
            correctResult = {
                term1Coeff: a * a,
                term1Exp: 2,
                term2Coeff: 2 * a * b,
                term2Exp: 1,
                constant: b * b
            };
            
            // Format correct answer string
            let cA = '';
            if (correctResult.term1Coeff !== 0) cA = formatTerm(correctResult.term1Coeff, var1, correctResult.term1Exp);
            if (correctResult.term2Coeff !== 0) cA += formatTerm(correctResult.term2Coeff, var1, correctResult.term2Exp, true);
            if (correctResult.constant !== 0) cA += formatConstant(correctResult.constant, true);
            if (cA === "") cA = "0";
            
            return { 
                question, 
                correctAnswer: cA, 
                options: generateDistractors_PerfectSquareCoeff(correctResult, var1, a, b) 
            };
        }

        // [Source 61]: (ax - b)^2 (Now Level 54)
        case 54: {
            // a, b > 0. minCoeff=2 from app.js ensures a, b != 1.
            a = getRandomCoeff(false); 
            b = getRandomCoeff(false);
            
            // Format question: (ax - b)^2
            question = `(${formatTerm(a, var1, 1)}${formatConstant(-b, true)})<sup>2</sup>`;
            
            // Calculate correct answer: a^2x^2 - 2abx + b^2
            correctResult = {
                term1Coeff: a * a,
                term1Exp: 2,
                term2Coeff: -2 * a * b,
                term2Exp: 1,
                constant: b * b
            };
            
            // Format correct answer string
            let cA = '';
            if (correctResult.term1Coeff !== 0) cA = formatTerm(correctResult.term1Coeff, var1, correctResult.term1Exp);
            if (correctResult.term2Coeff !== 0) cA += formatTerm(correctResult.term2Coeff, var1, correctResult.term2Exp, true);
            if (correctResult.constant !== 0) cA += formatConstant(correctResult.constant, true);
            if (cA === "") cA = "0";
            
            return { 
                question, 
                correctAnswer: cA, 
                options: generateDistractors_PerfectSquareCoeff(correctResult, var1, a, b) 
            };
        }

        // [Source 62]: (ax + b)^2 or (ax - b)^2 (Now Level 55)
        case 55: {
            // a, b > 0. minCoeff=2 from app.js ensures a, b != 1.
            a = getRandomCoeff(false); 
            b = getRandomCoeff(false);
            
            if (Math.random() < 0.5) {
                // --- (ax + b)^2 case (from Level 53) ---
                question = `(${formatTerm(a, var1, 1)}${formatConstant(b, true)})<sup>2</sup>`;
                correctResult = {
                    term1Coeff: a * a,      term1Exp: 2,
                    term2Coeff: 2 * a * b,  term2Exp: 1,
                    constant: b * b
                };
            } else {
                // --- (ax - b)^2 case (from Level 54) ---
                question = `(${formatTerm(a, var1, 1)}${formatConstant(-b, true)})<sup>2</sup>`;
                correctResult = {
                    term1Coeff: a * a,      term1Exp: 2,
                    term2Coeff: -2 * a * b, term2Exp: 1,
                    constant: b * b
                };
            }
            
            // Format correct answer string (works for both)
            let cA = '';
            if (correctResult.term1Coeff !== 0) cA = formatTerm(correctResult.term1Coeff, var1, correctResult.term1Exp);
            if (correctResult.term2Coeff !== 0) cA += formatTerm(correctResult.term2Coeff, var1, correctResult.term2Exp, true);
            if (correctResult.constant !== 0) cA += formatConstant(correctResult.constant, true);
            if (cA === "") cA = "0";
            
            return { 
                question, 
                correctAnswer: cA, 
                // The existing distractor function handles both cases perfectly
                options: generateDistractors_PerfectSquareCoeff(correctResult, var1, a, b) 
            };
        }
		// [Source 63]: (ax + b)(cx + d) (General Binomial) (Now Level 56)
        case 56: {
            // a, b, c, d can be < 0. minCoeff=2 ensures a, c != 1.
            a = getRandomCoeff(true); 
            b = getRandomCoeff(true);
            c = getRandomCoeff(true);
            d = getRandomCoeff(true);
            
            // Format question: (ax + b)(cx + d)
            let term1 = `(${formatTerm(a, var1, 1)}${formatConstant(b, true)})`;
            let term2 = `(${formatTerm(c, var1, 1)}${formatConstant(d, true)})`;
            question = `${term1}${term2}`;
            
            // Calculate correct answer: (ac)x^2 + (ad+bc)x + (bd)
            correctResult = {
                term1Coeff: a * c,
                term1Exp: 2,
                term2Coeff: (a * d) + (b * c),
                term2Exp: 1,
                constant: b * d
            };
            
            // Format correct answer string
            let cA = '';
            if (correctResult.term1Coeff !== 0) cA = formatTerm(correctResult.term1Coeff, var1, correctResult.term1Exp);
            if (correctResult.term2Coeff !== 0) cA += formatTerm(correctResult.term2Coeff, var1, correctResult.term2Exp, true);
            if (correctResult.constant !== 0) cA += formatConstant(correctResult.constant, true);
            if (cA === "") cA = "0";
            
            return { 
                question, 
                correctAnswer: cA, 
                options: generateDistractors_GeneralBinomial(correctResult, var1, a, b, c, d) 
            };
        }
		// [Source 65]: (ax + b) / c (Simple division/distribution) (Now Level 57)
        case 57: {
            // We generate the result coefficients first to ensure c divides evenly
            // minCoeff=2 from app.js ensures c is not 1.
            c = getRandomCoeff(true); // Denominator, can be negative

            // Result coefficients
            let resX = getRandomCoeff(true); // a/c
            let resC = getRandomCoeff(true); // b/c
            
            // Calculate the numerator coefficients
            a = resX * c; // Numerator x-coeff
            b = resC * c; // Numerator constant
            
            // Format question: (ax + b) / c
            let numerator = `${formatTerm(a, var1, 1)}${formatConstant(b, true)}`;
            let denominator = formatConstant(c);
            question = formatFractionHTML(numerator, denominator);
            
            // Set correct answer
            correctResult = {
                xCoeff: resX,
                constant: resC
            };
            
            // Format correct answer string
            let cA = '';
            if (correctResult.xCoeff !== 0) cA = formatTerm(correctResult.xCoeff, var1, 1);
            if (correctResult.constant !== 0) cA += formatConstant(correctResult.constant, correctResult.xCoeff !== 0);
            if (cA === "") cA = "0";
            
            return { 
                question, 
                correctAnswer: cA, 
                options: generateDistractors_SimpleDivision(correctResult, var1, a, b, c) 
            };
        }
	// [Source 88]: (ax^k + bx^m) / cx^n (Polynomial division by monomial) (Now Level 58)
        case 58: {
            // We generate the result coefficients first to ensure c divides evenly
            // minCoeff=2 from app.js ensures c is not 1.
            c = getRandomCoeff(true); // Denominator coeff

            // Result coefficients
            let resCoeff1 = getRandomCoeff(true); // a/c
            let resCoeff2 = getRandomCoeff(true); // b/c
            
            // Calculate the numerator coefficients
            a = resCoeff1 * c; 
            b = resCoeff2 * c;
            
            // Generate exponents
            n = getRandomExp(1, 3); // Denominator exponent
            let resExp1, resExp2;
            
            // Ensure result exponents are different and positive
            do {
                resExp1 = getRandomExp(1, 3); // k-n
                resExp2 = getRandomExp(1, 3); // m-n
            } while (resExp1 === resExp2);
            
            // Calculate numerator exponents
            k = resExp1 + n;
            m = resExp2 + n;

            // Format question: (ax^k + bx^m) / cx^n
            // Ensure numerator terms are in descending exponent order
            let numTerm1, numTerm2;
            if (k > m) {
                numTerm1 = formatTerm(a, var1, k);
                numTerm2 = formatTerm(b, var1, m, true);
            } else {
                // If m > k, put the 'b' term first
                numTerm1 = formatTerm(b, var1, m);
                numTerm2 = formatTerm(a, var1, k, true);
            }
            let numerator = `${numTerm1}${numTerm2}`;
            let denominator = formatTerm(c, var1, n);
            question = formatFractionHTML(numerator, denominator);
            
            // Set correct answer
            // Ensure terms are in a consistent (descending) order
            correctResult = {
                term1Coeff: (resExp1 > resExp2) ? resCoeff1 : resCoeff2,
                term1Exp:   (resExp1 > resExp2) ? resExp1 : resExp2,
                term2Coeff: (resExp1 > resExp2) ? resCoeff2 : resCoeff1,
                term2Exp:   (resExp1 > resExp2) ? resExp2 : resExp1
            };
            
            // Format correct answer string
            let cA = '';
            if (correctResult.term1Coeff !== 0) cA = formatTerm(correctResult.term1Coeff, var1, correctResult.term1Exp);
            if (correctResult.term2Coeff !== 0) cA += formatTerm(correctResult.term2Coeff, var1, correctResult.term2Exp, correctResult.term1Coeff !== 0);
            if (cA === "") cA = "0";
            
            return { 
                question, 
                correctAnswer: cA, 
                options: generateDistractors_MonomialDivision(correctResult, var1, a, b, c, k, m, n) 
            };
        }
		// [Source 91]: (a^2 - b^2) / (a +/- b) (Now Level 59)
        // We will use (x^2 - a^2) / (x +/- a)
        case 59: {
            // a > 0. minCoeff=2 from app.js ensures a != 1.
            a = getRandomCoeff(false);
            let a_squared = a * a;
            
            // Randomly choose denominator sign: (x + a) or (x - a)
            let denominatorSign = (Math.random() < 0.5) ? 1 : -1;
            
            // Format question
            let numerator = `${formatTerm(1, var1, 2)}${formatConstant(-a_squared, true)}`; // "x^2 - a^2"
            let denominator = `${var1}${formatConstant(a * denominatorSign, true)}`; // "(x + a)" or "(x - a)"
            question = formatFractionHTML(numerator, denominator);
            
            // Calculate correct answer
            // If denominatorSign is 1 (x+a), answer is (x-a) -> constant is -a
            // If denominatorSign is -1 (x-a), answer is (x+a) -> constant is +a
            let correct_constant = -denominatorSign * a;

            correctResult = {
                xCoeff: 1,
                constant: correct_constant
            };
            
            // Format correct answer string
            let cA = '';
            if (correctResult.xCoeff !== 0) cA = formatTerm(correctResult.xCoeff, var1, 1);
            if (correctResult.constant !== 0) cA += formatConstant(correctResult.constant, correctResult.xCoeff !== 0);
            if (cA === "") cA = "0";
            
            return { 
                question, 
                correctAnswer: cA, 
                options: generateDistractors_FactorDifferenceOfSquares(correctResult, var1, a) 
            };
        }
		// [Source 92]: (a^2 +/- 2ab + b^2) / (a +/- b) (Now Level 60)
        // We will use (x^2 +/- 2ax + a^2) / (x +/- a)
        case 60: {
            // a > 0. minCoeff=2 from app.js ensures a != 1.
            a = getRandomCoeff(false);
            
            // Randomly choose sign for the problem: 1 for (x+a), -1 for (x-a)
            let sign = (Math.random() < 0.5) ? 1 : -1;
            
            // Calculate numerator terms based on (x + sign*a)^2
            let middleTermCoeff = 2 * sign * a; // +2a or -2a
            let constantTerm = a * a; // +a^2
            
            // Calculate correct answer
            let correct_constant = sign * a;

            // Format question
            // Numerator: x^2 +/- 2ax + a^2
            let numerator = `${formatTerm(1, var1, 2)}${formatTerm(middleTermCoeff, var1, 1, true)}${formatConstant(constantTerm, true)}`;
            // Denominator: (x +/- a)
            let denominator = `${var1}${formatConstant(correct_constant, true)}`;
            question = formatFractionHTML(numerator, denominator);
            
            correctResult = {
                xCoeff: 1,
                constant: correct_constant
            };
            
            // Format correct answer string
            let cA = '';
            if (correctResult.xCoeff !== 0) cA = formatTerm(correctResult.xCoeff, var1, 1);
            if (correctResult.constant !== 0) cA += formatConstant(correctResult.constant, correctResult.xCoeff !== 0);
            if (cA === "") cA = "0";
            
            return { 
                question, 
                correctAnswer: cA, 
                options: generateDistractors_FactorPerfectSquare(correctResult, var1, a) 
            };
        }
		// [Source 93]: n(a^2 +/- 2ab + b^2) / (a +/- b) (Now Level 61)
        // We will use (nx^2 +/- 2anx + a^2n) / (x +/- a)
        case 61: {
            // a, n > 0. minCoeff=2 from app.js ensures a, n != 1.
            a = getRandomCoeff(false);
            n = getRandomCoeff(false);
            
            // Randomly choose sign for the problem: 1 for (x+a), -1 for (x-a)
            let sign = (Math.random() < 0.5) ? 1 : -1;
            
            // Calculate numerator terms by distributing 'n' into (x + sign*a)^2
            let term1Coeff = n;                 // n * x^2
            let term2Coeff = n * 2 * sign * a;  // n * (+/- 2ax)
            let constantTerm = n * a * a;       // n * (a^2)
            
            // Calculate correct answer: n * (x + sign*a)
            let correct_xCoeff = n;
            let correct_constant = n * sign * a;

            // Format question
            // Numerator: nx^2 +/- 2anx + a^2n
            let numerator = `${formatTerm(term1Coeff, var1, 2)}${formatTerm(term2Coeff, var1, 1, true)}${formatConstant(constantTerm, true)}`;
            // Denominator: x +/- a (no brackets)
            let denominator = `${var1}${formatConstant(correct_constant / n, true)}`;
            question = formatFractionHTML(numerator, denominator);
            
            correctResult = {
                xCoeff: correct_xCoeff,
                constant: correct_constant
            };
            
            // Format correct answer string: nx +/- na
            let cA = '';
            if (correctResult.xCoeff !== 0) cA = formatTerm(correctResult.xCoeff, var1, 1);
            if (correctResult.constant !== 0) cA += formatConstant(correctResult.constant, correctResult.xCoeff !== 0);
            if (cA === "") cA = "0";
            
            return { 
                question, 
                correctAnswer: cA, 
                options: generateDistractors_FactorPerfectSquareWithCoeff(correctResult, var1, n, a) 
            };
        }
		// [Source 94]: (ax + b)(cx + d) / (ax + b) (Now Level 62)
        // Numerator will be expanded
        case 62: {
            const n = 1; // n=1 for this level
            // a, b, c, d can be < 0. minCoeff=2 ensures a, c != 1.
            a = getRandomCoeff(true); 
            b = getRandomCoeff(true);
            c = getRandomCoeff(true);
            d = getRandomCoeff(true);
            
            // Randomly pick which factor is the answer and which is the denominator
            let denA, denB, ansC, ansD;
            if (Math.random() < 0.5) {
                // Denominator = ax+b, Answer = cx+d
                [denA, denB, ansC, ansD] = [a, b, c, d];
            } else {
                // Denominator = cx+d, Answer = ax+b
                [denA, denB, ansC, ansD] = [c, d, a, b];
            }

            // Calculate expanded numerator: n * (denA*x + denB) * (ansC*x + ansD)
            // n * ( (denA*ansC)x^2 + (denA*ansD + denB*ansC)x + (denB*ansD) )
            let t1 = n * denA * ansC;
            let t2 = n * (denA * ansD + denB * ansC);
            let t3 = n * denB * ansD;
            
            // Format question
            let numerator = `${formatTerm(t1, var1, 2)}${formatTerm(t2, var1, 1, true)}${formatConstant(t3, true)}`;
            let denominator = `${formatTerm(denA, var1, 1)}${formatConstant(denB, true)}`;
            question = formatFractionHTML(numerator, denominator);

            // Set correct answer: n * (ansC*x + ansD)
            correctResult = {
                xCoeff: n * ansC,
                constant: n * ansD
            };
            
            // Format correct answer string
            let cA = '';
            if (correctResult.xCoeff !== 0) cA = formatTerm(correctResult.xCoeff, var1, 1);
            if (correctResult.constant !== 0) cA += formatConstant(correctResult.constant, correctResult.xCoeff !== 0);
            if (cA === "") cA = "0";
            
            return { 
                question, 
                correctAnswer: cA, 
                // We pass 'a' and 'b' as the denominator factors
                options: generateDistractors_FactorGeneralBinomial(correctResult, var1, denA, denB, ansC, ansD, n) 
            };
        }

        // [Source 95]: n(ax + b)(cx + d) / (ax + b) (Now Level 63)
        // Numerator will be expanded
        case 63: {
            // n > 0. minCoeff=2 ensures n, a, c != 1.
            n = getRandomCoeff(false); 
            a = getRandomCoeff(true); 
            b = getRandomCoeff(true);
            c = getRandomCoeff(true);
            d = getRandomCoeff(true);
            
            // Randomly pick which factor is the answer and which is the denominator
            let denA, denB, ansC, ansD;
            if (Math.random() < 0.5) {
                // Denominator = ax+b, Answer = n(cx+d)
                [denA, denB, ansC, ansD] = [a, b, c, d];
            } else {
                // Denominator = cx+d, Answer = n(ax+b)
                [denA, denB, ansC, ansD] = [c, d, a, b];
            }

            // Calculate expanded numerator: n * ( (denA*ansC)x^2 + (denA*ansD + denB*ansC)x + (denB*ansD) )
            let t1 = n * denA * ansC;
            let t2 = n * (denA * ansD + denB * ansC);
            let t3 = n * denB * ansD;
            
            // Format question
            let numerator = `${formatTerm(t1, var1, 2)}${formatTerm(t2, var1, 1, true)}${formatConstant(t3, true)}`;
            let denominator = `${formatTerm(denA, var1, 1)}${formatConstant(denB, true)}`;
            question = formatFractionHTML(numerator, denominator);

            // Set correct answer: n * (ansC*x + ansD)
            correctResult = {
                xCoeff: n * ansC,
                constant: n * ansD
            };
            
            // Format correct answer string
            let cA = '';
            if (correctResult.xCoeff !== 0) cA = formatTerm(correctResult.xCoeff, var1, 1);
            if (correctResult.constant !== 0) cA += formatConstant(correctResult.constant, correctResult.xCoeff !== 0);
            if (cA === "") cA = "0";
            
            return { 
                question, 
                correctAnswer: cA, 
                // We pass 'a' and 'b' as the denominator factors
                options: generateDistractors_FactorGeneralBinomial(correctResult, var1, denA, denB, ansC, ansD, n) 
            };
        }
		
// ...

        default: // Fallback
            console.warn(`Difficulty level ${difficultyLevel} not yet implemented. Falling back to Case 1.`);
            return generateQuestion(1, minAbsCoeff, maxAbsCoeff);
    }
}