#include <stdio.h>
#include <ctype.h>
#include <string.h>
#include <stdlib.h>

// Token Types defined in Elmo specification [cite: 21, 135]
typedef enum {
    TOKEN_KEYWORD, TOKEN_IDENTIFIER, TOKEN_NUMBER, 
    TOKEN_STRING, TOKEN_OPERATOR, TOKEN_PUNCTUATION, 
    TOKEN_EOF, TOKEN_ERROR
} TokenType;

typedef struct {
    TokenType type;
    char lexeme[256];
    int line;
} Token;

int lineNum = 1;

// Keywords set [cite: 91, 135]
const char* keywords[] = {"int", "if", "else", "while", "return"};
int numKeywords = 5;

int isKeyword(char* str) {
    for (int i = 0; i < numKeywords; i++) {
        if (strcmp(str, keywords[i]) == 0) return 1;
    }
    return 0;
}

// Function to skip whitespace and comments [cite: 124-126]
void skipWhitespaceAndComments(FILE* f) {
    int c;
    while ((c = fgetc(f)) != EOF) {
        if (isspace(c)) {
            if (c == '\n') lineNum++;
            continue;
        }
        if (c == '/') {
            int next = fgetc(f);
            if (next == '/') { // Single-line comment 
                while ((c = fgetc(f)) != EOF && c != '\n');
                if (c == '\n') lineNum++;
                continue;
            } else {
                ungetc(next, f);
            }
        }
        ungetc(c, f);
        break;
    }
}

Token getNextToken(FILE* f) {
    skipWhitespaceAndComments(f);
    Token token;
    token.line = lineNum;
    int c = fgetc(f);

    if (c == EOF) {
        token.type = TOKEN_EOF;
        strcpy(token.lexeme, "EOF");
        return token;
    }

    // 1. Identifiers and Keywords [cite: 94-99, 152-154]
    if (isalpha(c) || c == '_') {
        int i = 0;
        token.lexeme[i++] = c;
        while (isalnum(c = fgetc(f)) || c == '_') {
            if (i < 255) token.lexeme[i++] = c;
        }
        ungetc(c, f);
        token.lexeme[i] = '\0';

        if (isKeyword(token.lexeme)) token.type = TOKEN_KEYWORD;
        else token.type = TOKEN_IDENTIFIER;
        return token;
    }

    // 2. Integer Literals (No leading zeros except '0') [cite: 100-106, 155-157]
    if (isdigit(c)) {
        int i = 0;
        if (c == '0') {
            token.lexeme[i++] = c;
            int next = fgetc(f);
            if (isdigit(next)) { // Error: No leading zeros 
                token.type = TOKEN_ERROR;
                token.lexeme[i++] = next;
                token.lexeme[i] = '\0';
                return token;
            }
            ungetc(next, f);
        } else {
            token.lexeme[i++] = c;
            while (isdigit(c = fgetc(f))) {
                if (i < 255) token.lexeme[i++] = c;
            }
            ungetc(c, f);
        }
        token.lexeme[i] = '\0';
        token.type = TOKEN_NUMBER;
        return token;
    }

    // 3. String Literals [cite: 107-113, 162-164]
    if (c == '"') {
        int i = 0;
        while ((c = fgetc(f)) != EOF && c != '"') {
            if (c == '\\') { // Handle escape sequences 
                int next = fgetc(f);
                if (next == 'n') token.lexeme[i++] = '\n';
                else if (next == 't') token.lexeme[i++] = '\t';
                else if (next == '\\') token.lexeme[i++] = '\\';
                else if (next == '"') token.lexeme[i++] = '"';
            } else {
                token.lexeme[i++] = c;
            }
        }
        token.lexeme[i] = '\0';
        token.type = TOKEN_STRING;
        return token;
    }

    // 4. Operators and Punctuation [cite: 114-123, 166-169]
    char next = fgetc(f);
    token.lexeme[0] = c;
    token.lexeme[1] = next;
    token.lexeme[2] = '\0';

    // Two-character operators [cite: 167]
    if ((c == '=' && next == '=') || (c == '!' && next == '=') || 
        (c == '<' && next == '=') || (c == '>' && next == '=') ||
        (c == '&' && next == '&') || (c == '|' && next == '|')) {
        token.type = TOKEN_OPERATOR;
        return token;
    }
    
    ungetc(next, f);
    token.lexeme[1] = '\0';

    // Single-character operators [cite: 118, 122]
    if (strchr("+-*/=<>!", c)) {
        token.type = TOKEN_OPERATOR;
        return token;
    }

    // Punctuation [cite: 135]
    if (strchr(";(){}", c)) {
        token.type = TOKEN_PUNCTUATION;
        return token;
    }

    token.type = TOKEN_ERROR;
    return token;
}

int main() {
    FILE* file = fopen("sample.elmo", "r");
    if (!file) {
        printf("Error: Could not open sample.elmo\n");
        return 1;
    }

    printf("%-20s %-15s %-5s\n", "LEXEME", "TOKEN TYPE", "LINE");
    printf("---------------------------------------------\n");

    Token t;
    do {
        t = getNextToken(file);
        if (t.type != TOKEN_EOF) {
            const char* typeStr[] = {"KEYWORD", "IDENTIFIER", "NUMBER", "STRING", "OPERATOR", "PUNCTUATION", "EOF", "ERROR"};
            printf("%-20s %-15s %-5d\n", t.lexeme, typeStr[t.type], t.line);
        }
    } while (t.type != TOKEN_EOF);

    fclose(file);
    return 0;
}