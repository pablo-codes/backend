/**
 * Construct prompt with context for the AI model
 * @param {string} userQuery - User's question
 * @param {Array} contextData - Relevant context from knowledge base
 * @returns {Array} Messages array for chat completion
 */
const constructPrompt = (userQuery, contextData) => {
    // Combine relevant context
    const context = contextData.map(item => {
        // Extract key information from the context item
        const title = item.title || item.extractedData?.page_title || item.url || 'Untitled';
        const content = item.content || item.chunk || item.extractedData?.main_content || '';
        const keyInfo = item.extractedData?.key_information || '';
        const url = item.url || '';

        let contextText = `Source: ${title}\n`;
        if (content) contextText += `Content: ${content}\n`;
        if (keyInfo) contextText += `Key Information: ${keyInfo}\n`;
        if (url) contextText += `URL: ${url}\n`;

        return contextText;
    }).join('\n---\n');

    // System message with instructions
    const systemMessage = {
        role: "system",
        content: `# Role and Goal
You are a specialized AI assistant for **Business Analysis School**, an edtech platform founded by **Eno Eka**. Your primary goal is to help professionals transition into high-paying Business Analysis, Scrum, Agile, and Data Analytics roles. Act as a knowledgeable and encouraging guide to convert inquiries into qualified leads.

# Persona
- **Tone:** Professional, helpful, encouraging, and motivational.
- **Focus:** Always provide specific, accurate information based *only* on the context provided here.
- **Objective:** Highlight the value of Business Analysis School's programs to help users achieve their career goals.

---

# Guiding Principles & Behavioral Rules

1.  **Prioritize the Flagship Offer:** If a user's query is general, about starting a new career, or finding a job, **always** promote the free masterclass: *“Land your 6 Figure Business Analysis Job in 2024”* by Eno Eka. This is your primary lead-generation tool.

2.  **Map Keywords to Products:** When a user mentions a specific topic, directly recommend the relevant program.
    * "Scrum Master" -> **SMC® Certification**.
    * "Product Owner" -> **SPOC® Certification**.
    * "Six Sigma" or "Process Improvement" -> **SSBB™ or LSSBB™ Certifications**.
    * "Beginner" or "Getting Started in BA" -> **Business Analysis Foundations Course**.
    * "Data" -> **Data Analytics Accelerator Program**.

3.  **Always Provide a Source:** For every course, program, or certification you mention, you **must** include the source URL from the knowledge base below.

4.  **Human Handoff Protocol:** For questions about pricing details not listed, personalized career advice, or if the user expresses a clear intent to enroll, direct them to an **Enrollment Specialist**. For example: "That's an excellent question for determining your specific career path. Our Enrollment Specialists can provide personalized guidance. You can chat with Mary on WhatsApp here: [link]."

5.  **Safety:** Do not invent information. If you cannot answer a question from the context below, state: "I don't have the specific information on that, but our support team can definitely help. You can reach them at support@businessanalysisschool.com."

---

# Knowledge Base

## Leadership
- **CEO & Founder:** Eno Eka (she/her), a career coach and consultant.

## Flagship Free Offer
- **Title:** “Land your 6 Figure Business Analysis Job in 2024” masterclass.
- **URL:** https://www.businessanalysisschool.com/free-training

## Certifications
- **SCRUMstudy:**
  - **SDC®:** $200, 98% pass rate. [URL: https://www.businessanalysisschool.com/scrum-developer-certified]
  - **SMC®:** $450, 95% pass rate. [URL: https://www.businessanalysisschool.com/scrum-master-certified]
  - **SPOC®:** $600, 93% pass rate. [URL: https://www.businessanalysisschool.com/scrum-product-owner-certified]
  - **SAMC™:** $550, 93% pass rate. [URL: https://www.businessanalysisschool.com/scrumstudy-agile-master-certified]
- **6sigmastudy:**
  - **SSBB™:** $500, 95% pass rate. [URL: https://www.businessanalysisschool.com/six-sigma-black-belt]
  - **LSSBB™:** $550, 93% pass rate (prerequisite: Green Belt). [URL: https://www.businessanalysisschool.com/lean-six-sigma-black-belt]

## Programs
- **Product Management Accelerator:** [URL: https://www.businessanalysisschool.com/product-management-accelerator-course]
- **Data Analytics Accelerator:** 6-week program, weekends, certification included. [URL: https://www.businessanalysisschool.com/data-analytics-accelerator-course]

## On-Demand Courses
- Business Analysis Foundations
- Business Analysis Masterclass
- Strategic Business Analysis Masterclass
- **URL for all courses:** https://www.businessanalysisschool.com/on-demand-courses

---

# Contact & Socials

- **General Support:** support@businessanalysisschool.com
- **Enrollment Specialists:**
  - Mary: [WhatsApp](https://wa.me/message/2N77EZP35HOEC1)
  - Queen: [WhatsApp](https://wa.me/+2349085516252)
  - Hauwa: [WhatsApp](https://wa.me/message/U5NVWTN5EGFYK1)
- **Socials:**
  - [LinkedIn](https://www.linkedin.com/company/businessanalysisschool/)
  - [YouTube](https://www.youtube.com/channel/UChHOIFLNiieDdmpIPOFUfJw)
  - [Instagram](https://www.instagram.com/businessanalysisschool/)

Current date: ${new Date().toLocaleDateString()}`
    };

    // User message with query and context
    const userMessage = {
        role: "user",
        content: `Context Information:
${context}

Question: ${userQuery}

Please provide a helpful and accurate response based on the context above. Include relevant links and mention specific programs when appropriate.`
    };

    return [systemMessage, userMessage];
};




/**
 * Format sources for response
 * @param {Array} contextData - Context data with sources
 * @returns {Array} Formatted source URLs
 */
const formatSources = (contextData) => {
    if (!contextData || !Array.isArray(contextData)) {
        return [];
    }

    return contextData
        .map(item => item.url)
        .filter(url => url && typeof url === 'string')
        .slice(0, 3); // Limit to top 3 sources
};



/**
 * Generate contextual CTA based on user query and confidence

 */
const generateCTA = (userQuery, confidence) => {
    const lowerQuery = userQuery.toLowerCase();

    // HIGH CONFIDENCE (>= 0.75) - Very specific matches
    if (confidence >= 0.75) {
        // --- Specific Certification Queries ---
        if (lowerQuery.includes('samc') || (lowerQuery.includes('agile') && lowerQuery.includes('master'))) {
            return {
                text: "Become a SCRUMstudy Agile Master (SAMC™). Exam cost: $550.",
                type: "samc_certification_exam",
                url: "https://www.businessanalysisschool.com/scrumstudy-agile-master-certified"
            };
        }
        if (lowerQuery.includes('lssbb') || (lowerQuery.includes('lean') && lowerQuery.includes('six sigma') && lowerQuery.includes('black belt'))) {
            return {
                text: "Achieve the highest level of Six Sigma mastery with the LSSBB™ exam for $550.",
                type: "lssbb_certification_exam",
                url: "https://www.businessanalysisschool.com/lean-six-sigma-black-belt"
            };
        }
        if (lowerQuery.includes('ssbb') || (lowerQuery.includes('six sigma') && lowerQuery.includes('black belt'))) {
            return {
                text: "Advance your expertise with the Six Sigma Black Belt (SSBB™) exam for $500.",
                type: "ssbb_certification_exam",
                url: "https://www.businessanalysisschool.com/six-sigma-black-belt"
            };
        }
        if (lowerQuery.includes('sdc') || (lowerQuery.includes('scrum') && lowerQuery.includes('developer'))) {
            return {
                text: "Get Scrum Developer Certified (SDC®) and validate your skills. Exam cost: $200.",
                type: "sdc_certification_exam",
                url: "https://www.businessanalysisschool.com/scrum-developer-certified"
            };
        }
        if (lowerQuery.includes('smc') || (lowerQuery.includes('scrum') && lowerQuery.includes('master'))) {
            return {
                text: "Ready to lead a Scrum team? Get Scrum Master Certified (SMC®) for $450.",
                type: "smc_certification_exam",
                url: "https://www.businessanalysisschool.com/scrum-master-certified"
            };
        }
        if (lowerQuery.includes('spoc') || (lowerQuery.includes('scrum') && lowerQuery.includes('product owner'))) {
            return {
                text: "Master the product backlog with the SPOC® certification. Exam cost: $600.",
                type: "spoc_certification_exam",
                url: "https://www.businessanalysisschool.com/scrum-product-owner-certified"
            };
        }

        // --- Specific Course/Program Queries ---
        if (lowerQuery.includes('data analytics') && (lowerQuery.includes('course') || lowerQuery.includes('accelerator'))) {
            return {
                text: "Launch your Data Analytics career in just 6 weeks. Enroll in our Accelerator Course.",
                type: "data_analytics_course_enrollment",
                url: "https://www.businessanalysisschool.com/data-analytics-accelerator-course#payment"
            };
        }
        if (lowerQuery.includes('product management') && (lowerQuery.includes('course') || lowerQuery.includes('accelerator'))) {
            return {
                text: "Accelerate your career in Product Management. Enroll in our course now.",
                type: "product_management_course_enrollment",
                url: "https://www.businessanalysisschool.com/product-management-accelerator-course#payment"
            };
        }
        if (lowerQuery.includes('foundation') || lowerQuery.includes('beginner')) {
            return {
                text: "New to Business Analysis? Our Foundation Course is the perfect place to start.",
                type: "ba_foundation_course_details",
                url: "https://www.businessanalysisschool.com/business-analysis-foundation-course"
            };
        }
        if (lowerQuery.includes('land') && lowerQuery.includes('job')) {
            return {
                text: "Ready to land your dream job in Business Analysis? Enroll in our specialized course.",
                type: "land_job_course_enrollment",
                url: "https://www.businessanalysisschool.com/land-your-business-analysis-job#payment"
            };
        }
        if (lowerQuery.includes('free') && (lowerQuery.includes('training') || lowerQuery.includes('course'))) {
            return {
                text: "Learn how to land a 6-figure role in 90 days. Register for your FREE training now!",
                type: "free_training_registration",
                url: "https://www.businessanalysisschool.com/free-training"
            };
        }
        if (lowerQuery.includes('masterclass')) {
            return {
                text: "Take your skills to the next level. Enroll in the Business Analysis Masterclass now!",
                type: "ba_masterclass_enrollment",
                url: "https://www.businessanalysisschool.com/ba-masterclass#payment_section"
            };
        }
    }

    // MEDIUM CONFIDENCE (>= 0.4) - Broader category matches
    if (confidence >= 0.4) {
        if (lowerQuery.includes('certification') || lowerQuery.includes('certified') || lowerQuery.includes('exam')) {
            return {
                text: "We have certifications for every stage of your career. Explore our certification classes.",
                type: "certification_classes_overview",
                url: "https://www.businessanalysisschool.com/certification-classes"
            };
        }
        if (lowerQuery.includes('coaching') || lowerQuery.includes('accelerator') || lowerQuery.includes('program')) {
            return {
                text: "Get personalized guidance to accelerate your career. Explore our coaching programs.",
                type: "coaching_programs_overview",
                url: "https://www.businessanalysisschool.com/coaching-programs"
            };
        }
        if (lowerQuery.includes('course') || lowerQuery.includes('learn') || lowerQuery.includes('training')) {
            return {
                text: "Browse our full catalog of on-demand courses and start learning today.",
                type: "on_demand_courses_overview",
                url: "https://www.businessanalysisschool.com/on-demand-courses"
            };
        }
        if (lowerQuery.includes('eno eka') || lowerQuery.includes('founder') || lowerQuery.includes('ceo')) {
            return {
                text: "Learn more about our founder and CEO, Eno Eka, and her mission.",
                type: "about_us",
                url: "https://www.businessanalysisschool.com/about-us"
            };
        }
    }

    // LOW CONFIDENCE (< 0.4) - General fallback
    return {
        text: "Have questions or need support? Our team is here to help. Contact us now.",
        type: "contact_support",
        url: "https://www.businessanalysisschool.com/contact-us"
    };
};




export { constructPrompt, generateCTA, formatSources };