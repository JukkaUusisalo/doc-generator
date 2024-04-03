import { TSDocConfiguration, TSDocTagDefinition, TSDocTagSyntaxKind } from '@microsoft/tsdoc';


export function getCustomConfiguration() {
    const configuration = new TSDocConfiguration();

    const customTag = new TSDocTagDefinition({
        tagName: '@AuditLog',
        syntaxKind: TSDocTagSyntaxKind.ModifierTag,
    });
    configuration.addTagDefinition(customTag);
    return configuration
}