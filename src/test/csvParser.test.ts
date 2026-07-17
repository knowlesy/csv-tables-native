import { describe, it, expect } from 'vitest';
import { parseCsv } from '../utils/csvParser';

describe('parseCsv', () => {
    it('should handle basic CSV without quotes', () => {
        const input = 'a,b,c\n1,2,3';
        const expected = [
            ['a', 'b', 'c'],
            ['1', '2', '3']
        ];
        expect(parseCsv(input)).toEqual(expected);
    });

    it('should handle quotes', () => {
        const input = '"a","b","c"\n"1","2","3"';
        const expected = [
            ['a', 'b', 'c'],
            ['1', '2', '3']
        ];
        expect(parseCsv(input)).toEqual(expected);
    });

    it('should handle commas within quotes', () => {
        const input = 'a,"b,c",d\n1,"2,3",4';
        const expected = [
            ['a', 'b,c', 'd'],
            ['1', '2,3', '4']
        ];
        expect(parseCsv(input)).toEqual(expected);
    });

    it('should handle newlines within quotes', () => {
        const input = 'a,"b\nc",d\n1,2,3';
        const expected = [
            ['a', 'b\nc', 'd'],
            ['1', '2', '3']
        ];
        expect(parseCsv(input)).toEqual(expected);
    });

    it('should handle escaped quotes within quotes', () => {
        const input = 'a,"b""c",d\n1,2,3';
        const expected = [
            ['a', 'b"c', 'd'],
            ['1', '2', '3']
        ];
        expect(parseCsv(input)).toEqual(expected);
    });

    it('should handle empty fields', () => {
        const input = 'a,,c\n1,2,\n,,3';
        const expected = [
            ['a', '', 'c'],
            ['1', '2', ''],
            ['', '', '3']
        ];
        expect(parseCsv(input)).toEqual(expected);
    });

    it('should handle empty input', () => {
        expect(parseCsv('')).toEqual([]);
        expect(parseCsv('   ')).toEqual([]);
    });

    it('should trim spaces outside quotes', () => {
        const input = ' a , " b " , c \n 1 , 2 , 3 ';
        const expected = [
            ['a', 'b', 'c'],
            ['1', '2', '3']
        ];
        expect(parseCsv(input)).toEqual(expected);
    });

    it('should handle CRLF correctly', () => {
        const input = 'a,b,c\r\n1,2,3';
        const expected = [
            ['a', 'b', 'c'],
            ['1', '2', '3']
        ];
        expect(parseCsv(input)).toEqual(expected);
    });
});
