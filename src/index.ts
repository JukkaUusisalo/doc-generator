import ts from 'typescript';
import {DocNode, DocPlainText, TSDocParser} from '@microsoft/tsdoc';
import * as fs from 'fs';
import * as path from 'path';
import { getCustomConfiguration }from './CustomAuditLogTag'

const args = process.argv.slice(2);
const fileNames = getFilesRecursive(args[0]);
let program = ts.createProgram(fileNames, {});
let checker = program.getTypeChecker();


for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.isDeclarationFile) {
        ts.forEachChild(sourceFile, parseSourceFile);
    }
}

function getFilesRecursive(folderPath: string): string[] {
    let fileNames: string[] = [];

    const items = fs.readdirSync(folderPath, { withFileTypes: true });
    for (const item of items) {
        const fullPath = path.join(folderPath, item.name);
        if (item.isDirectory()) {
            fileNames = fileNames.concat(getFilesRecursive(fullPath));
        } else {
            if(fullPath.endsWith('.ts'))
                fileNames.push(fullPath);
        }
    }

    return fileNames;
}




function parseSourceFile(node: ts.Node) {
    const parser = new TSDocParser(getCustomConfiguration());
    const parsedCtx = parser.parseString(node.getFullText());
    if(parsedCtx.docComment.modifierTagSet.hasTagName('@AuditLog')) {
        const summaryBlock = parsedCtx.docComment.summarySection;
        let summaryTxt = 'No summary';
        if (summaryBlock) {
            // summaryTxt =  summaryBlock.getChildNodes()
            //     .map(docNode => docNode.kind.trim()).join('').trim();
            summaryTxt = summaryBlock.getChildNodes()
                .map(docNode => parseSummaryBlockNodes(docNode))
                .join('').trim()
        }
        console.log(summaryTxt);
    }
}

function parseSummaryBlockNodes(docNode: DocNode):string {
    let content = '';
    for(const childNode of docNode.getChildNodes()) {
        if(childNode instanceof DocPlainText)
            content = content.concat(childNode.text + '\n');
        content = content.concat(parseSummaryBlockNodes(childNode));
    }
    return content
}

