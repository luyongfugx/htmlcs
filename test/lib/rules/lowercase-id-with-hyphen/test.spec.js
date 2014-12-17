/**
 * @file test for rule lowercase-id-with-hyphen
 * @author nighca<nighca@live.cn>
 */

var path = require('path');
var hinter = require('../../../../');

var rule = path.basename(__dirname);

describe('rule ' + rule, function () {
    var result = hinter.hintFile(path.join(__dirname, 'case.html'));

    it('should return right result', function () {
        expect(result.length).toBe(2);

        expect(result[0].type).toBe('WARN');
        expect(result[0].code).toBe('020');
        expect(result[0].line).toBe(10);
        expect(result[0].col).toBe(5);

        expect(result[1].type).toBe('WARN');
        expect(result[1].code).toBe('021');
        expect(result[1].line).toBe(11);
        expect(result[1].col).toBe(5);
    });
});