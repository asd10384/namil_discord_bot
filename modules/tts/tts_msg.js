
module.exports = {
    tts_msg: function tts_msg (text) {
        text = text.replace(/\?/gi, '물음표') || text;
        text = text.replace(/\!/gi, '느낌표') || text;
        text = text.replace(/\~/gi, '물결표') || text;

        text = text.replace(/\'/gi, '따옴표') || text;
        text = text.replace(/\"/gi, '큰따옴표') || text;

        text = text.replace(/\(/gi, '여는소괄호') || text;
        text = text.replace(/\)/gi, '닫는소괄호') || text;
        text = text.replace(/\{/gi, '여는중괄호') || text;
        text = text.replace(/\}/gi, '닫는중괄호') || text;
        text = text.replace(/\[/gi, '여는대괄호') || text;
        text = text.replace(/\]/gi, '닫는대괄호') || text;

        text = text.replace(/ㄹㅇ/gi, '리얼') || text;
        text = text.replace(/ㅅㅂ/gi, '시바') || text;
        text = text.replace(/ㄲㅂ/gi, '까비') || text;
        text = text.replace(/ㅅㄱ/gi, '수고') || text;
        text = text.replace(/ㅎㅇ/gi, '하이') || text;
        text = text.replace(/ㄴㅇㅅ/gi, '나이스') || text;
    
        return text;
    },
}