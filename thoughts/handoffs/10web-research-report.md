# Research Report: 10web.io AI Website Builder for WordPress

**Generated:** 2026-01-11  
**Research Agent:** Oracle  

---

## Summary

10Web is an AI-powered WordPress platform that combines website building, hosting, and management tools. At its core is a multi-agent AI architecture using models from OpenAI (GPT-4o-mini-azure), Anthropic (Claude 3 Sonnet), and Google Gemini, all fine-tuned for the WordPress ecosystem. The platform outputs WordPress-native content via a forked Elementor integration, with their newest "Vibe for WordPress" product using React + Tailwind for AI-native frontend editing while maintaining full WordPress backend compatibility.

---

## Questions Answered

### Q1: What technologies power 10web.io's AI website builder?

**Answer:** 10Web uses a multi-model AI architecture with dynamic model selection:
- **LLMs:** GPT-4o-mini-azure, Claude 3 Sonnet, GPT-4, Llama 2, Google Gemini
- **Image Generation:** DALL-E, Stable Diffusion
- **Frontend (Vibe):** React + Tailwind CSS
- **Backend:** WordPress, PHP (Laravel), Python-Flask, NodeJS, Angular 17
- **ML Framework:** TensorFlow, PyTorch
- **Editor:** Forked Elementor with 50+ custom widgets
- **Infrastructure:** Google Cloud, OVHcloud, Cloudflare Enterprise CDN

**Source:** [10Web Technology Page](https://10web.io/technology/), [AI Website Builder API Blog](https://10web.io/blog/ai-website-builder-api/)  
**Confidence:** High (VERIFIED from multiple official sources)

---

### Q2: How do they generate WordPress-compatible output from AI prompts?

**Answer:** 10Web uses a multi-stage generative pipeline with specialized AI agents:

1. **Prompt Interpretation Stage:** User provides business name, industry, tone preferences
2. **Outline Generation:** AI generates site structure (pages, sections)
3. **Layout Composition:** Proprietary "generative layout engine" creates section arrangements
4. **Content Generation:** Separate agents handle copywriting and image generation
5. **Widget Mapping:** Deep neural network classifies content into Elementor widgets
6. **Layout Construction:** Algorithms convert layouts into Elementor sections/columns structure
7. **Publishing:** Output is a native WordPress site with Elementor page templates

Key insight: They don't use Gutenberg blocks. Output is **Elementor-native** with sections, columns, and widgets.

**Source:** [AI Website Builder API Blog](https://10web.io/blog/ai-website-builder-api/), [10Web Technology Page](https://10web.io/technology/)  
**Confidence:** High (VERIFIED)

---

### Q3: How do they generate websites that load directly inside WordPress?

**Answer:** The secret is their **Elementor integration**:
- 10Web maintains a **forked version of Elementor** as their editing interface
- AI output maps directly to Elementor's data model (sections, columns, widgets)
- The site IS a real WordPress installation with:
  - 10Web's proprietary theme
  - Elementor page builder plugin (their fork)
  - 50+ premium custom widgets
  - AI Co-Pilot plugin for chat-based editing

This is NOT a headless/decoupled architecture - it's native WordPress with Elementor as the page builder layer.

**Source:** [10Web Help Center](https://help.10web.io/hc/en-us/articles/7952757255186-AI-Website-Builder-Fully-Automated-WordPress-Website-Creation-in-a-Few-Minutes)  
**Confidence:** High (VERIFIED)

---

### Q4: Are they using Gutenberg blocks, custom themes, or a page builder plugin?

**Answer:** **Page builder plugin (Elementor fork)**

- NOT Gutenberg blocks
- Custom 10Web theme + forked Elementor
- 40+ designer-made templates
- 50+ premium widgets (Elementor + 10Web custom)
- Widgets include: pricing tables, sliders, galleries, CTAs, testimonials, checkout blocks

Their new **Vibe for WordPress** product (announced October 2025) uses a React + Tailwind frontend that produces **deterministic code diffs** - every AI or manual change is traceable at the code level.

**Source:** [Vibe for WordPress Press Release](https://10web.io/press-kit/press-release-vibe-for-wordpress/), [The Repository](https://www.therepository.email/10web-launches-vibe-for-wordpress-another-ai-builder-that-turns-prompts-into-full-sites)  
**Confidence:** High (VERIFIED)

---

### Q5: How does their "select to edit" functionality work?

**Answer:** The AI Co-Pilot architecture:

1. **Selection:** User clicks any widget/element in the Elementor editor
2. **Context Capture:** "Selected element" appears in Co-Pilot chat window
3. **Natural Language Input:** User types instruction (e.g., "make this blue", "add more text")
4. **AI Processing:** Multi-agent system interprets intent and maps to Elementor operations
5. **Widget Modification:** AI modifies widget settings, content, or layout
6. **Deterministic Changes:** Changes produce trackable diffs (in Vibe)
7. **Undo Support:** Both AI-level undo (via chat) and manual undo (editor button)

Current scope: Widget and section-level editing. Page/full-site editing coming soon.

**Source:** [Co-Pilot Editor Help](https://help.10web.io/hc/en-us/articles/23970145055122-Co-Pilot-Editor)  
**Confidence:** High (VERIFIED)

---

### Q6: How does the chat-based editing maintain context about the page?

**Answer:** The multi-agent system has context awareness through:

1. **Page Structure Context:** AI knows the full Elementor DOM structure
2. **Selected Element Binding:** Explicit selection creates focused context
3. **Widget Classification:** Neural network understands widget types (slider vs gallery vs CTA)
4. **Conversation History:** Chat interface maintains session context
5. **WordPress Ecosystem Knowledge:** Agents fine-tuned specifically for WordPress/Elementor operations

**Source:** [10Web Technology Page](https://10web.io/technology/)  
**Confidence:** Medium (INFERRED from architecture descriptions)

---

### Q7: How do they clone existing websites from any platform into WordPress?

**Answer:** 10Web's "AI Assistant" migration pipeline:

1. **URL Input:** User provides source URL (any platform: Wix, Squarespace, custom HTML)
2. **Page Analysis:** Algorithms analyze web page content, structure, and layout
3. **Widget Classification:** Deep neural network classifies page sections into widget types
4. **Feature Extraction:** Algorithms identify:
   - Menu/submenu structures
   - Gallery types (grid vs masonry)
   - CTA buttons
   - Slider layers
   - Typography and background styles
   - Animations (parallax, entrance effects)
5. **Layout Reconstruction:** Convert source layout system to Elementor sections/columns
6. **Template Generation:** Output zipped Elementor template
7. **WordPress Installation:** Install template on WordPress site

Key: They **do not copy source code** - they recreate functionally using ML classification.

**Source:** [10Web Technology Page](https://10web.io/technology/), [Toolify AI News](https://www.toolify.ai/ai-news/effortlessly-clone-any-website-with-10webs-ai-builder-1352697)  
**Confidence:** High (VERIFIED)

---

### Q8: What's the hosting infrastructure?

**Answer:** Multi-provider managed WordPress hosting:

- **Primary:** Google Cloud Platform (99.99% uptime target)
- **Secondary:** OVHcloud for high-availability
- **CDN:** Cloudflare Enterprise
- **Features:**
  - Automated backups (daily)
  - Staging environments
  - Isolated containers per site
  - SSL certificates (free)
  - PHP version control
  - SFTP/SSH access
  - Malware detection
  - DDoS protection
  - PageSpeed optimization (target: 90+)

**Source:** [10Web Pricing](https://10web.io/pricing-platform/)  
**Confidence:** High (VERIFIED)

---

### Q9: What's the pricing model?

**Answer:** Subscription-based, starting at $10/month (annual):

| Plan | Price (Annual) | Key Features |
|------|----------------|--------------|
| Business | $10/mo | 1 site, AI builder, 10GB storage |
| Ecommerce | Higher tier | WooCommerce, Stripe, analytics |
| Agency | Custom | White-label, multi-site, VIP support |
| Enterprise | Custom | Dedicated hosting |

- No free plan (7-14 day free trial)
- Annual pricing is 50% cheaper than monthly
- API access for partners/developers

**Source:** [10Web Pricing](https://10web.io/pricing-platform/), [G2 Pricing](https://www.g2.com/products/10web/pricing)  
**Confidence:** High (VERIFIED)

---

### Q10: What's the API architecture?

**Answer:** RESTful API with full documentation:

- **Base:** `https://apidocs.10web.io/`
- **SDKs:** Python, JavaScript
- **Endpoints for:**
  - Workspace management
  - Template operations
  - Page generation
  - Media handling
  - Publishing
  - DNS zones/domains
  - SSL certificates
  - Backups
- **Coming soon:** Outline Editor API, sitemap, layout customization

API-first design - all UI operations available programmatically.

**Source:** [10Web API Documentation](https://apidocs.10web.io/), [API Help Center](https://help.10web.io/hc/en-us/articles/27304964365586-Introduction-to-10Web-API)  
**Confidence:** High (VERIFIED)

---

## Detailed Findings

### Finding 1: Multi-Agent AI Architecture

**Source:** [10Web Blog - AI Website Builder API](https://10web.io/blog/ai-website-builder-api/)

**Key Points:**
- Network of specialized AI agents, not single-model approach
- Each agent trained for specific task: copywriting, layout, image generation
- Dynamic model switching based on benchmarks
- Models include: GPT-4o-mini-azure, Claude 3 Sonnet, Gemini
- Fine-tuned for WordPress/Elementor ecosystem

**Architecture Diagram (Conceptual):**
```
User Prompt
    |
    v
[Prompt Interpreter Agent]
    |
    v
[Structure Generator] --> [Layout Engine]
    |                          |
    v                          v
[Copy Agent] <-----> [Visual Agent]
    |                          |
    v                          v
[Widget Mapper (Neural Net)]
    |
    v
[Elementor Template Builder]
    |
    v
WordPress Site
```

---

### Finding 2: Widget Classification Neural Network

**Source:** [10Web Technology Page](https://10web.io/technology/)

**Key Points:**
- Deep neural network at the heart of the AI Assistant
- Classifies HTML elements into Elementor widget types
- Distinguishes: CTA blocks, image boxes, sliders, galleries, pricing tables, background videos
- Feature extraction algorithms identify:
  - Menu structures (including nested submenus)
  - Gallery layouts (grid vs masonry)
  - Button types
  - Slider layers
  - Animation types (parallax, entrance)
  - Typography styles
  - Background properties

**Technical Approach:**
```python
# Conceptual - not actual 10Web code
class WidgetClassifier:
    """Deep neural network for HTML → Elementor widget classification"""
    
    widget_types = [
        'heading', 'text_editor', 'image', 'button', 'icon',
        'gallery', 'slider', 'video', 'pricing_table',
        'call_to_action', 'testimonial', 'form', 'menu',
        'countdown', 'progress_bar', 'social_icons'
    ]
    
    def classify(self, html_element, styles, context):
        # Extract features from element
        features = self.extract_features(html_element, styles)
        # Neural network classification
        widget_type = self.model.predict(features)
        # Extract widget-specific settings
        settings = self.extract_settings(html_element, widget_type)
        return ElementorWidget(type=widget_type, settings=settings)
```

---

### Finding 3: Vibe for WordPress - React + Tailwind Frontend

**Source:** [Vibe Press Release](https://10web.io/press-kit/press-release-vibe-for-wordpress/)

**Key Points:**
- Announced October 2025
- Modern React + Tailwind CSS frontend
- Produces **deterministic code diffs** (every change is traceable)
- Full WordPress backend integration
- AI-native editing with natural language
- Supports: plugins, SEO, WooCommerce
- Containerized environment
- Coming soon: Figma/screenshot → design generation

**Why This Matters:**
- Moves beyond Elementor's drag-drop limitations
- Enables "vibe coding" - describe what you want, AI builds it
- Code-level control while maintaining WordPress compatibility
- Better for developers who want to inspect/modify output

---

### Finding 4: Migration/Cloning Technology Deep Dive

**Source:** [10Web Technology Page](https://10web.io/technology/)

**Pipeline Steps:**

1. **Input:** Source URL from any platform
2. **Fetch:** Download HTML, CSS, assets
3. **Parse:** Analyze DOM structure
4. **Classify:** Neural network identifies sections/widgets
5. **Extract Features:**
   - Per HTML tag: hundreds of properties, styles, nested elements
   - Algorithm identifies "important" features (those humans notice)
   - Examples: menu hierarchy, gallery type, slider layers
6. **Layout Mapping:**
   - Source may use any CSS layout (grid, flex, float, etc.)
   - Algorithms convert to Elementor sections/columns
   - Preserves: alignments, sizes, margins, paddings
   - Output is responsive
7. **Style Transfer:**
   - Typography extraction
   - Color palette identification
   - Background handling
8. **Animation Recreation:**
   - Parallax effects
   - Entrance animations
   - Sliders
9. **Template Output:** Elementor-compatible template package

**Limitations:**
- Only one page at a time (no full-site import)
- Inherits target site's header/footer/colors
- Complex custom functionality may not transfer

---

### Finding 5: Tech Stack from Job Postings

**Source:** [Staff.am 10Web](https://staff.am/company/10web), [6sense Company Profile](https://6sense.com/company/10webio/5d2dbf2f2faa194742006e15)

**Confirmed Stack:**
| Category | Technologies |
|----------|--------------|
| ML/AI | TensorFlow, PyTorch |
| Frontend | Angular 17, React (Vibe) |
| Backend | Python-Flask, NodeJS |
| PHP | Laravel, WordPress |
| Infrastructure | Cloudflare, Google Cloud, OVHcloud |
| Database | (Not specified - likely MySQL for WordPress) |

**Team Size:** 100-249 employees  
**Engineering:** Currently most open roles are in Engineering & Technical

---

## Known Limitations & Challenges

**Source:** [Durable AI Tools Review](https://durable.co/ai-tools/10web), [AppSumo Reviews](https://appsumo.com/products/10web-ai-website-builder/reviews/)

| Limitation | Details |
|------------|---------|
| Generic Content | AI output needs substantial editing for brand voice |
| Template Sameness | Sites tend to look similar after building multiple |
| WordPress Learning Curve | Assumes basic WP/Elementor familiarity |
| 5-Page Limit | AI Builder currently limited to 5 pages |
| Storage Limits | 10GB on Personal plan fills quickly |
| No Email Integration | Requires separate email solution |
| Migration Issues | Complex sites may need manual troubleshooting |
| Pricing | No free plan, annual commitment recommended |
| E-commerce Setup | Manual product/shipping/tax configuration required |

---

## Comparison Matrix: 10Web vs Building Similar System

| Component | 10Web Approach | DIY Alternative |
|-----------|----------------|-----------------|
| AI Models | Multi-model (GPT-4, Claude, Gemini) | OpenAI API + Anthropic API |
| Page Builder | Forked Elementor | Gutenberg blocks or custom React |
| Widget Classification | Proprietary neural network | Train custom model or rules-based |
| Layout Engine | Proprietary generative engine | LLM-driven structure generation |
| Hosting | Google Cloud + OVHcloud | Any WordPress hosting |
| CDN | Cloudflare Enterprise | Cloudflare free/pro |
| Editor | Elementor + AI Co-Pilot | Custom React editor |
| Migration | ML-based page analysis | Puppeteer + HTML parsing |

---

## Recommendations for Building Similar System

### Core Architecture Recommendations

1. **Multi-Agent Over Single-Model**
   - Use specialized agents for structure, copy, images, layout
   - Allows fine-tuning each component
   - Enables model swapping as better models release

2. **Page Builder Integration Decision**
   - **Option A:** Fork Elementor (10Web approach) - mature, complex, WordPress-native
   - **Option B:** Gutenberg blocks - modern, WordPress core, limited widgets
   - **Option C:** Custom React frontend (like Vibe) - full control, more dev work

3. **Widget Classification System**
   - Train classifier on labeled dataset of web page elements
   - Output must map to target builder's widget taxonomy
   - Include feature extraction for styles, content, layout

4. **API-First Design**
   - All generation operations via REST API
   - Enables white-label, partner integrations
   - Document from day one

### Implementation Priorities

1. **Phase 1:** Basic generation pipeline
   - Prompt → Structure → Content → Simple template
   - Use GPT-4 for structure + copy
   - Static layout engine

2. **Phase 2:** Real-time editing
   - Element selection + chat interface
   - Context-aware modifications
   - Undo/redo support

3. **Phase 3:** Migration/cloning
   - URL → HTML analysis → template generation
   - Widget classification model
   - Layout reconstruction

4. **Phase 4:** Advanced features
   - Deterministic diffs
   - Figma import
   - Custom widget creation

---

## Technical Challenges Identified

1. **Widget Classification Accuracy**
   - HTML/CSS is messy and inconsistent
   - Same visual element can have many implementations
   - Need robust feature extraction

2. **Layout Reconstruction**
   - Source sites use various layout systems (grid, flex, float)
   - Target (Elementor) uses sections/columns paradigm
   - Responsive behavior must be preserved

3. **Style Fidelity**
   - Typography, colors, spacing must match closely
   - CSS specificity can be tricky
   - Background handling (images, gradients, videos)

4. **Context Maintenance**
   - Chat-based editing needs page awareness
   - Must know what's selected, what's nearby
   - Changes should be contextually appropriate

5. **WordPress Ecosystem Complexity**
   - Theme conflicts
   - Plugin compatibility
   - Performance optimization
   - Security hardening

---

## Sources

1. [10Web Technology Page](https://10web.io/technology/) - Core technology overview
2. [AI Website Builder API Blog](https://10web.io/blog/ai-website-builder-api/) - Pipeline architecture
3. [Vibe for WordPress Press Release](https://10web.io/press-kit/press-release-vibe-for-wordpress/) - React/Tailwind frontend
4. [10Web API Documentation](https://apidocs.10web.io/) - API reference
5. [10Web Help Center](https://help.10web.io/) - User documentation
6. [10Web Pricing](https://10web.io/pricing-platform/) - Plan details
7. [Durable 10Web Review](https://durable.co/ai-tools/10web) - Limitations analysis
8. [WP Lift Vibe Coverage](https://wplift.com/10web-the-first-ever-ai-powered-vibe-coding-frontend-builder/) - Vibe for WordPress analysis
9. [The Repository](https://www.therepository.email/10web-launches-vibe-for-wordpress-another-ai-builder-that-turns-prompts-into-full-sites) - Industry analysis
10. [Toolify AI News - Cloning](https://www.toolify.ai/ai-news/effortlessly-clone-any-website-with-10webs-ai-builder-1352697) - Migration technology

---

## Open Questions

1. **Exact neural network architecture for widget classification?**
   - No public papers or detailed technical documentation found
   - Would need to reverse-engineer or build custom solution

2. **How do they handle dynamic content (forms, user accounts)?**
   - Migration of functional elements not well documented
   - Likely manual recreation required

3. **What's the token/cost structure for their AI operations?**
   - Multi-model architecture must have complex cost optimization
   - No public information on their model routing logic

4. **How do they maintain Elementor fork compatibility?**
   - Elementor updates regularly
   - Forking strategy for long-term maintenance unclear

---

*Research completed by Oracle agent. Report saved to `thoughts/handoffs/10web-research-report.md`*
