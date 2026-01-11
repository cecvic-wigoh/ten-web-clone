/**
 * Tests for Gutenberg Block Serializer
 *
 * TDD: These tests define the expected behavior of the block serializer.
 * Tests should FAIL initially, then pass after implementation.
 */

import { describe, it, expect } from 'vitest';
import {
  serializeBlock,
  serializeBlocks,
  BlockNode,
} from '../serializer';

describe('Block Serializer', () => {
  describe('serializeBlock', () => {
    describe('core/heading', () => {
      it('should serialize a heading block with default level', () => {
        const block: BlockNode = {
          name: 'core/heading',
          attributes: {},
          innerContent: ['Hello World'],
        };

        const result = serializeBlock(block);

        expect(result).toBe(
          '<!-- wp:heading -->\n' +
          '<h2 class="wp-block-heading">Hello World</h2>\n' +
          '<!-- /wp:heading -->'
        );
      });

      it('should serialize a heading with custom level', () => {
        const block: BlockNode = {
          name: 'core/heading',
          attributes: { level: 1 },
          innerContent: ['Main Title'],
        };

        const result = serializeBlock(block);

        expect(result).toBe(
          '<!-- wp:heading {"level":1} -->\n' +
          '<h1 class="wp-block-heading">Main Title</h1>\n' +
          '<!-- /wp:heading -->'
        );
      });

      it('should serialize heading levels 1-6', () => {
        for (let level = 1; level <= 6; level++) {
          const block: BlockNode = {
            name: 'core/heading',
            attributes: { level },
            innerContent: [`Level ${level}`],
          };

          const result = serializeBlock(block);

          expect(result).toContain(`<h${level} class="wp-block-heading">`);
          expect(result).toContain(`</h${level}>`);
        }
      });

      it('should handle heading with textAlign attribute', () => {
        const block: BlockNode = {
          name: 'core/heading',
          attributes: { level: 2, textAlign: 'center' },
          innerContent: ['Centered Heading'],
        };

        const result = serializeBlock(block);

        expect(result).toContain('"textAlign":"center"');
        expect(result).toContain('has-text-align-center');
      });
    });

    describe('core/paragraph', () => {
      it('should serialize a simple paragraph', () => {
        const block: BlockNode = {
          name: 'core/paragraph',
          attributes: {},
          innerContent: ['This is a paragraph.'],
        };

        const result = serializeBlock(block);

        expect(result).toBe(
          '<!-- wp:paragraph -->\n' +
          '<p>This is a paragraph.</p>\n' +
          '<!-- /wp:paragraph -->'
        );
      });

      it('should handle paragraph with HTML content', () => {
        const block: BlockNode = {
          name: 'core/paragraph',
          attributes: {},
          innerContent: ['This is <strong>bold</strong> and <em>italic</em>.'],
        };

        const result = serializeBlock(block);

        expect(result).toContain('<strong>bold</strong>');
        expect(result).toContain('<em>italic</em>');
      });

      it('should handle paragraph with alignment', () => {
        const block: BlockNode = {
          name: 'core/paragraph',
          attributes: { align: 'center' },
          innerContent: ['Centered text'],
        };

        const result = serializeBlock(block);

        expect(result).toContain('has-text-align-center');
      });
    });

    describe('core/image', () => {
      it('should serialize an image block', () => {
        const block: BlockNode = {
          name: 'core/image',
          attributes: {
            url: 'https://example.com/image.jpg',
            alt: 'Example image',
          },
          innerContent: [],
        };

        const result = serializeBlock(block);

        expect(result).toContain('<!-- wp:image');
        expect(result).toContain('<!-- /wp:image -->');
        expect(result).toContain('src="https://example.com/image.jpg"');
        expect(result).toContain('alt="Example image"');
      });

      it('should handle image with width and height', () => {
        const block: BlockNode = {
          name: 'core/image',
          attributes: {
            url: 'https://example.com/image.jpg',
            alt: 'Sized image',
            width: 800,
            height: 600,
          },
          innerContent: [],
        };

        const result = serializeBlock(block);

        expect(result).toContain('width="800"');
        expect(result).toContain('height="600"');
      });

      it('should handle image with caption', () => {
        const block: BlockNode = {
          name: 'core/image',
          attributes: {
            url: 'https://example.com/image.jpg',
            alt: 'Captioned image',
            caption: 'This is the caption',
          },
          innerContent: [],
        };

        const result = serializeBlock(block);

        expect(result).toContain('<figcaption');
        expect(result).toContain('This is the caption');
      });
    });

    describe('core/group', () => {
      it('should serialize an empty group', () => {
        const block: BlockNode = {
          name: 'core/group',
          attributes: {},
          innerContent: [],
        };

        const result = serializeBlock(block);

        expect(result).toContain('<!-- wp:group');
        expect(result).toContain('<!-- /wp:group -->');
        expect(result).toContain('wp-block-group');
      });

      it('should serialize a group with children', () => {
        const block: BlockNode = {
          name: 'core/group',
          attributes: { layout: { type: 'constrained' } },
          innerBlocks: [
            {
              name: 'core/heading',
              attributes: { level: 1 },
              innerContent: ['Welcome'],
            },
            {
              name: 'core/paragraph',
              attributes: {},
              innerContent: ['Description here.'],
            },
          ],
          innerContent: [null, null],
        };

        const result = serializeBlock(block);

        expect(result).toContain('<!-- wp:heading');
        expect(result).toContain('Welcome');
        expect(result).toContain('<!-- wp:paragraph');
        expect(result).toContain('Description here.');
      });

      it('should handle group with layout type', () => {
        const block: BlockNode = {
          name: 'core/group',
          attributes: { layout: { type: 'flex', justifyContent: 'center' } },
          innerContent: [],
        };

        const result = serializeBlock(block);

        expect(result).toContain('"layout"');
        expect(result).toContain('"type":"flex"');
      });
    });

    describe('core/columns', () => {
      it('should serialize columns with column children', () => {
        const block: BlockNode = {
          name: 'core/columns',
          attributes: {},
          innerBlocks: [
            {
              name: 'core/column',
              attributes: {},
              innerBlocks: [
                {
                  name: 'core/paragraph',
                  attributes: {},
                  innerContent: ['Column 1 content'],
                },
              ],
              innerContent: [null],
            },
            {
              name: 'core/column',
              attributes: {},
              innerBlocks: [
                {
                  name: 'core/paragraph',
                  attributes: {},
                  innerContent: ['Column 2 content'],
                },
              ],
              innerContent: [null],
            },
          ],
          innerContent: [null, null],
        };

        const result = serializeBlock(block);

        expect(result).toContain('<!-- wp:columns');
        expect(result).toContain('<!-- wp:column');
        expect(result).toContain('Column 1 content');
        expect(result).toContain('Column 2 content');
      });

      it('should handle column width attribute', () => {
        const block: BlockNode = {
          name: 'core/column',
          attributes: { width: '33.33%' },
          innerContent: [],
        };

        const result = serializeBlock(block);

        expect(result).toContain('"width":"33.33%"');
      });
    });

    describe('core/buttons and core/button', () => {
      it('should serialize a button block', () => {
        const block: BlockNode = {
          name: 'core/button',
          attributes: {
            url: 'https://example.com',
            text: 'Click Me',
          },
          innerContent: ['Click Me'],
        };

        const result = serializeBlock(block);

        expect(result).toContain('<!-- wp:button');
        expect(result).toContain('href="https://example.com"');
        expect(result).toContain('Click Me');
      });

      it('should serialize buttons container with button children', () => {
        const block: BlockNode = {
          name: 'core/buttons',
          attributes: {},
          innerBlocks: [
            {
              name: 'core/button',
              attributes: { url: 'https://example.com', text: 'Primary' },
              innerContent: ['Primary'],
            },
          ],
          innerContent: [null],
        };

        const result = serializeBlock(block);

        expect(result).toContain('<!-- wp:buttons');
        expect(result).toContain('<!-- wp:button');
        expect(result).toContain('Primary');
      });

      it('should handle button with background color', () => {
        const block: BlockNode = {
          name: 'core/button',
          attributes: {
            url: '#',
            text: 'Styled',
            backgroundColor: 'primary',
          },
          innerContent: ['Styled'],
        };

        const result = serializeBlock(block);

        expect(result).toContain('has-primary-background-color');
      });
    });

    describe('core/cover', () => {
      it('should serialize a cover block', () => {
        const block: BlockNode = {
          name: 'core/cover',
          attributes: {
            url: 'https://example.com/background.jpg',
            dimRatio: 50,
          },
          innerBlocks: [
            {
              name: 'core/heading',
              attributes: { level: 2 },
              innerContent: ['Cover Title'],
            },
          ],
          innerContent: [null],
        };

        const result = serializeBlock(block);

        expect(result).toContain('<!-- wp:cover');
        expect(result).toContain('background.jpg');
        expect(result).toContain('Cover Title');
      });

      it('should handle cover with overlay color', () => {
        const block: BlockNode = {
          name: 'core/cover',
          attributes: {
            overlayColor: 'black',
            dimRatio: 80,
          },
          innerContent: [],
        };

        const result = serializeBlock(block);

        expect(result).toContain('has-black-background-color');
      });
    });

    describe('core/spacer', () => {
      it('should serialize a spacer block', () => {
        const block: BlockNode = {
          name: 'core/spacer',
          attributes: { height: '50px' },
          innerContent: [],
        };

        const result = serializeBlock(block);

        expect(result).toBe(
          '<!-- wp:spacer {"height":"50px"} -->\n' +
          '<div style="height:50px" aria-hidden="true" class="wp-block-spacer"></div>\n' +
          '<!-- /wp:spacer -->'
        );
      });
    });

    describe('core/separator', () => {
      it('should serialize a separator block', () => {
        const block: BlockNode = {
          name: 'core/separator',
          attributes: {},
          innerContent: [],
        };

        const result = serializeBlock(block);

        expect(result).toContain('<!-- wp:separator');
        expect(result).toContain('<hr');
        expect(result).toContain('wp-block-separator');
      });

      it('should handle separator with style', () => {
        const block: BlockNode = {
          name: 'core/separator',
          attributes: { className: 'is-style-wide' },
          innerContent: [],
        };

        const result = serializeBlock(block);

        expect(result).toContain('is-style-wide');
      });
    });

    describe('core/list and core/list-item', () => {
      it('should serialize a list with items', () => {
        const block: BlockNode = {
          name: 'core/list',
          attributes: {},
          innerBlocks: [
            {
              name: 'core/list-item',
              attributes: {},
              innerContent: ['First item'],
            },
            {
              name: 'core/list-item',
              attributes: {},
              innerContent: ['Second item'],
            },
          ],
          innerContent: [null, null],
        };

        const result = serializeBlock(block);

        expect(result).toContain('<!-- wp:list');
        expect(result).toContain('<ul');
        expect(result).toContain('First item');
        expect(result).toContain('Second item');
      });

      it('should handle ordered list', () => {
        const block: BlockNode = {
          name: 'core/list',
          attributes: { ordered: true },
          innerBlocks: [
            {
              name: 'core/list-item',
              attributes: {},
              innerContent: ['Step 1'],
            },
          ],
          innerContent: [null],
        };

        const result = serializeBlock(block);

        expect(result).toContain('<ol');
      });
    });
  });

  describe('serializeBlocks', () => {
    it('should serialize multiple blocks', () => {
      const blocks: BlockNode[] = [
        {
          name: 'core/heading',
          attributes: { level: 1 },
          innerContent: ['Title'],
        },
        {
          name: 'core/paragraph',
          attributes: {},
          innerContent: ['Content here.'],
        },
      ];

      const result = serializeBlocks(blocks);

      expect(result).toContain('<!-- wp:heading');
      expect(result).toContain('Title');
      expect(result).toContain('<!-- wp:paragraph');
      expect(result).toContain('Content here.');
    });

    it('should separate blocks with newlines', () => {
      const blocks: BlockNode[] = [
        {
          name: 'core/heading',
          attributes: {},
          innerContent: ['First'],
        },
        {
          name: 'core/heading',
          attributes: {},
          innerContent: ['Second'],
        },
      ];

      const result = serializeBlocks(blocks);

      // Blocks should be separated by double newline
      expect(result).toMatch(/<!-- \/wp:heading -->\n\n<!-- wp:heading/);
    });
  });

  describe('Edge Cases', () => {
    it('should escape special characters in attributes', () => {
      const block: BlockNode = {
        name: 'core/heading',
        attributes: { anchor: 'test"quote' },
        innerContent: ['Test'],
      };

      const result = serializeBlock(block);

      // JSON attributes should be properly escaped
      expect(result).toContain('"anchor":"test\\"quote"');
    });

    it('should handle empty innerContent', () => {
      const block: BlockNode = {
        name: 'core/spacer',
        attributes: { height: '20px' },
        innerContent: [],
      };

      const result = serializeBlock(block);

      expect(result).toBeDefined();
      expect(result).not.toContain('undefined');
    });

    it('should handle deeply nested blocks', () => {
      const block: BlockNode = {
        name: 'core/group',
        attributes: {},
        innerBlocks: [
          {
            name: 'core/group',
            attributes: {},
            innerBlocks: [
              {
                name: 'core/paragraph',
                attributes: {},
                innerContent: ['Deep nested content'],
              },
            ],
            innerContent: [null],
          },
        ],
        innerContent: [null],
      };

      const result = serializeBlock(block);

      expect(result).toContain('Deep nested content');
      // Should have 3 levels of blocks
      expect(result.match(/<!-- wp:group/g)?.length).toBe(2);
    });
  });
});
