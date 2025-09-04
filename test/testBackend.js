import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { togetherAIClient, togetherAIConfig } from '../config/togetherAi.js';
import { generateEmbedding, generateQueryEmbedding } from '../services/embedding.service.js';
import { generateChatResponse } from '../services/chat.service.js';
import { searchRelevantContent } from '../services/knowledge.service.js';

// Load environment variables
dotenv.config();

/**
 * Enhanced CTA Generation Function
 * Based on the comprehensive Business Analysis School knowledge base
 */
const generateCTA = (userQuery, confidence) => {
    const lowerQuery = userQuery.toLowerCase();

    // High confidence CTAs
    if (confidence >= 0.7) {
        // --- Specific Certification CTAs ---
        if (lowerQuery.includes('samc') || (lowerQuery.includes('agile') && lowerQuery.includes('master'))) {
            return {
                text: "Ready to get certified for $550? Schedule your SAMC™ exam today!",
                type: "samc_certification",
                url: "https://www.businessanalysisschool.com/scrumstudy-agile-master-certified"
            };
        } else if (lowerQuery.includes('lssbb') || (lowerQuery.includes('lean') && lowerQuery.includes('six sigma') && lowerQuery.includes('black belt'))) {
            return {
                text: "Advance your expertise! Register for the Lean Six Sigma Black Belt (LSSBB™) exam ($550).",
                type: "lssbb_certification",
                url: "https://www.businessanalysisschool.com/lean-six-sigma-black-belt"
            };
        } else if (lowerQuery.includes('ssbb') || (lowerQuery.includes('six sigma') && lowerQuery.includes('black belt') && !lowerQuery.includes('lean'))) {
            return {
                text: "Advance your expertise! Register for the Six Sigma Black Belt (SSBB™) exam ($500).",
                type: "ssbb_certification",
                url: "https://www.businessanalysisschool.com/six-sigma-black-belt"
            };
        } else if (lowerQuery.includes('sdc') || (lowerQuery.includes('scrum') && lowerQuery.includes('developer'))) {
            return {
                text: "Start your Scrum journey! Get certified as a Scrum Developer (SDC®) for $200.",
                type: "sdc_certification",
                url: "https://www.businessanalysisschool.com/scrum-developer-certified"
            };
        } else if (lowerQuery.includes('smc') || (lowerQuery.includes('scrum') && lowerQuery.includes('master'))) {
            return {
                text: "Become a Scrum Master! Register for the SMC® exam ($450).",
                type: "smc_certification",
                url: "https://www.businessanalysisschool.com/scrum-master-certified"
            };
        } else if (lowerQuery.includes('spoc') || (lowerQuery.includes('scrum') && lowerQuery.includes('product owner'))) {
            return {
                text: "Lead product development! Register for the SPOC® exam ($600).",
                type: "spoc_certification",
                url: "https://www.businessanalysisschool.com/scrum-product-owner-certified"
            };
        }
        // --- Course/Program CTAs ---
        else if (lowerQuery.includes('masterclass') || (lowerQuery.includes('job') && lowerQuery.includes('six figure')) || (lowerQuery.includes('career') && lowerQuery.includes('six figure')) || (lowerQuery.includes('income') && lowerQuery.includes('six figure'))) {
            if (lowerQuery.includes('job')) {
                return {
                    text: "Land your 6-figure job! Join our free masterclass.",
                    type: "free_masterclass_job",
                    url: "https://www.businessanalysisschool.com/land-your-business-analysis-job"
                };
            } else {
                return {
                    text: "Want to skyrocket your career? Enroll in our Business Analysis Masterclass!",
                    type: "ba_masterclass",
                    url: "https://www.businessanalysisschool.com"
                };
            }
        } else if (lowerQuery.includes('coaching') || lowerQuery.includes('accelerator') || (lowerQuery.includes('program') && !lowerQuery.includes('certification'))) {
            return {
                text: "Want personalized guidance? Explore our coaching programs!",
                type: "coaching_programs",
                url: "https://www.businessanalysisschool.com/coaching-programs"
            };
        } else if (lowerQuery.includes('product management') && lowerQuery.includes('course')) {
            return {
                text: "Master Product Management! Enroll in our Accelerator Course.",
                type: "product_management_course",
                url: "https://www.businessanalysisschool.com/coaching-programs"
            };
        } else if (lowerQuery.includes('data analytics') && lowerQuery.includes('course')) {
            return {
                text: "Launch your Data Analytics career! Join our Accelerator Course.",
                type: "data_analytics_course",
                url: "https://www.businessanalysisschool.com/coaching-programs"
            };
        }
        // --- Free Resource CTA ---
        else if (lowerQuery.includes('free') && (lowerQuery.includes('training') || lowerQuery.includes('course') || lowerQuery.includes('start'))) {
            return {
                text: "Start for free! Access our limited free training.",
                type: "free_training",
                url: "https://www.businessanalysisschool.com"
            };
        }
        // --- Foundation/Basics CTA ---
        else if (lowerQuery.includes('foundation') || lowerQuery.includes('beginner') || (lowerQuery.includes('ba') && (lowerQuery.includes('course') || lowerQuery.includes('start')))) {
            return {
                text: "New to Business Analysis? Start with our Foundation Course!",
                type: "ba_foundation_course",
                url: "https://www.businessanalysisschool.com"
            };
        }
    }

    // Medium confidence CTAs
    if (confidence >= 0.4) {
        if (lowerQuery.includes('certification') || lowerQuery.includes('course') || lowerQuery.includes('learn')) {
            return {
                text: "Explore our wide range of certifications and courses!",
                type: "all_certifications",
                url: "https://www.businessanalysisschool.com"
            };
        } else if (lowerQuery.includes('career') || lowerQuery.includes('job') || lowerQuery.includes('resume') || lowerQuery.includes('interview')) {
            return {
                text: "Need more personalized help? Connect with our career advisors!",
                type: "career_advice",
                url: "https://www.businessanalysisschool.com"
            };
        }
    }

    // Low confidence fallback CTA
    return {
        text: "Connect with a Support Agent",
        type: "human_support",
        url: "https://www.businessanalysisschool.com"
    };
};

/**
 * Test Enhanced CTA Functionality
 */
const testEnhancedCTA = async () => {
    try {
        console.log('🔍 Testing Enhanced CTA Functionality...\n');

        const testScenarios = [
            {
                query: "What is the cost of SAMC certification?",
                confidence: 0.85,
                expectedType: "samc_certification"
            },
            {
                query: "Tell me about Six Sigma Black Belt certification",
                confidence: 0.80,
                expectedType: "ssbb_certification"
            },
            {
                query: "What about Lean Six Sigma Black Belt?",
                confidence: 0.80,
                expectedType: "lssbb_certification"
            },
            {
                query: "I want to become a Scrum Developer",
                confidence: 0.75,
                expectedType: "sdc_certification"
            },
            {
                query: "How can I land a 6-figure job?",
                confidence: 0.80,
                expectedType: "free_masterclass_job"
            },
            {
                query: "Tell me about coaching programs",
                confidence: 0.70,
                expectedType: "coaching_programs"
            },
            {
                query: "I want to learn product management",
                confidence: 0.75,
                expectedType: "product_management_course"
            },
            {
                query: "Do you have free training?",
                confidence: 0.75,
                expectedType: "free_training"
            },
            {
                query: "I'm new to business analysis",
                confidence: 0.75,
                expectedType: "ba_foundation_course"
            },
            {
                query: "What certifications do you offer?",
                confidence: 0.60,
                expectedType: "all_certifications"
            },
            {
                query: "Help me with my career",
                confidence: 0.50,
                expectedType: "career_advice"
            },
            {
                query: "This is too complex for me",
                confidence: 0.30,
                expectedType: "human_support"
            }
        ];

        console.log('🧪 Testing CTA Generation:');
        let passedTests = 0;

        testScenarios.forEach((scenario, index) => {
            const cta = generateCTA(scenario.query, scenario.confidence);
            const match = cta.type === scenario.expectedType ? '✅' : '⚠️';

            console.log(`   ${index + 1}. "${scenario.query}" (${scenario.confidence})`);
            console.log(`      → "${cta.text}"`);
            console.log(`      → Type: ${cta.type} ${match}`);
            console.log(`      → URL: ${cta.url}`);
            console.log();

            if (cta.type === scenario.expectedType) {
                passedTests++;
            }
        });

        console.log(`📊 CTA Test Results: ${passedTests}/${testScenarios.length} scenarios matched expected types`);

        if (passedTests >= testScenarios.length * 0.8) {
            console.log('🎉 Enhanced CTA function is working well!');
            return true;
        } else {
            console.log('⚠️  Some CTA scenarios need review');
            return false;
        }
    } catch (error) {
        console.error('   ❌ Enhanced CTA Test Failed:', error.message);
        return false;
    }
};

/**
 * Test TogetherAI Connection
 */
const testTogetherAIConnection = async () => {
    try {
        console.log('🔍 Testing TogetherAI Connection...');

        if (!togetherAIConfig.apiKey) {
            throw new Error('TOGETHERAI_API_KEY not configured');
        }

        // Test embedding generation
        const testText = "What is SAMC certification?";
        console.log(`   Testing embedding for: "${testText}"`);
        const embedding = await generateEmbedding(testText);
        console.log(`   ✅ Embedding generated successfully (${embedding.length} dimensions)`);

        // Test chat completion
        const testMessages = [
            { role: "system", content: "You are a helpful assistant for Business Analysis School." },
            { role: "user", content: "What is the SAMC certification exam format?" }
        ];

        console.log('   Testing chat completion...');
        const chatResponse = await generateChatResponse(testMessages);
        console.log(`   ✅ Chat response generated (${chatResponse.content.substring(0, 50)}...)`);

        return true;
    } catch (error) {
        console.error('   ❌ TogetherAI Connection Test Failed:', error.message);
        return false;
    }
};

/**
 * Test MongoDB Connection and Query
 */
const testMongoDBConnection = async () => {
    try {
        console.log('🔍 Testing MongoDB Connection...');

        // Connect to database
        await connectDB();
        console.log('   ✅ Connected to MongoDB successfully');

        // Test query embedding generation
        const queryText = "SDC certification requirements";
        console.log(`   Testing query embedding for: "${queryText}"`);
        const queryEmbedding = await generateQueryEmbedding(queryText);
        console.log(`   ✅ Query embedding generated (${queryEmbedding.length} dimensions)`);

        // Test knowledge base search (this will use fallback if vector search index doesn't exist)
        console.log('   Testing knowledge base search...');
        const searchResults = await searchRelevantContent(queryEmbedding, 3, 0.5);
        console.log(`   ✅ Knowledge base search completed (${searchResults.length} results)`);

        return true;
    } catch (error) {
        console.error('   ❌ MongoDB Connection Test Failed:', error.message);
        return false;
    }
};

/**
 * Test Complete Chat Flow with Enhanced CTA
 */
const testCompleteChatFlow = async () => {
    try {
        console.log('🔍 Testing Complete Chat Flow with Enhanced CTA...');

        const userQuery = "Who is Eno Eka";

        // Step 1: Generate query embedding
        console.log(`   User Query: "${userQuery}"`);
        const queryEmbedding = await generateQueryEmbedding(userQuery);

        // Step 2: Search knowledge base
        const relevantContent = await searchRelevantContent(queryEmbedding, 3, 0.5);
        console.log(`   Found ${relevantContent.length} relevant content pieces`);

        // Step 3: Construct prompt (simplified for test)
        const promptMessages = [
            {
                role: "system",
                content: `You are an AI assistant for Business Analysis School, a leading edtech platform helping professionals upskill in Business Analysis, Scrum, Agile, and related fields to achieve six-figure incomes without tech degrees.

Key information about Business Analysis School:
- **Flagship Free Offer:** "Land your 6 Figure Business Analysis Job in 2024" masterclass by Eno Eka, focused on career transition and job placement.
- **Certifications:** Offers various certifications including:
  - SCRUMstudy certifications: Scrum Developer Certified (SDC® - $200, 98% pass rate), SCRUM Master Certified (SMC® - $450, 95% pass rate), SCRUM Product Owner Certified (SPOC® - $600, 93% pass rate), SCRUMstudy Agile Master Certified (SAMC™ - $550, 93% pass rate, 100 questions, 120 mins).
  - 6sigmastudy certifications: Six Sigma Black Belt (SSBB™ - $500, 95% pass rate, 125 questions, 180 mins), Lean Six Sigma Black Belt (LSSBB™ - $550, 93% pass rate, 125 questions, 180 mins). Prerequisites often include Green Belt.
- **Coaching/Accelerator Programs:** Includes specialized programs like the Product Management Accelerator Course and the Data Analytics Accelerator Course, designed for practical skill building.
- **On-Demand Courses:** A range of self-paced courses covering foundational to advanced topics, including various masterclasses and practical skill applications.
- **Focus:** Helping students transition into tech/business roles, develop in-demand skills, and achieve significant career and income growth through expert-led instruction and a global community.


Always maintain a professional, helpful, and encouraging tone. Focus on providing value to potential students by giving specific, accurate information based on the context. Highlight relevant Business Analysis School programs, courses, certifications, and resources (like the free masterclass) to guide users and support lead generation. If unsure, direct them to contact support (support@businessanalysisschool.com) or explore the website.`
            },
            {
                role: "user",
                content: `Question: ${userQuery}\n\nBased on the information about SAMC certification costing $550, please answer.`
            }
        ];

        // Step 4: Generate response
        const aiResponse = await generateChatResponse(promptMessages);
        console.log(`   AI Response: "${aiResponse.content}"`);

        // Step 5: Simple confidence check
        const confidence = Math.min(aiResponse.content.length / 100, 0.9);
        console.log(`   Confidence Score: ${confidence.toFixed(2)}`);

        // Step 6: Generate CTA
        const cta = generateCTA(userQuery, confidence);
        console.log(`   Generated CTA: "${cta.text}" (${cta.type})`);
        console.log(`   CTA URL: ${cta.url}`);

        return true;
    } catch (error) {
        console.error('   ❌ Complete Chat Flow Test Failed:', error.message);
        return false;
    }
};

/**
 * Run all tests
 */
const runAllTests = async () => {
    console.log('🧪 Running Backend Component Tests...\n');

    let passedTests = 0;
    const totalTests = 4;

    // Test 1: Enhanced CTA Functionality
    const ctaTestPassed = await testEnhancedCTA();
    if (ctaTestPassed) passedTests++;
    console.log();

    // Test 2: TogetherAI Connection
    const togetherAITestPassed = await testTogetherAIConnection();
    if (togetherAITestPassed) passedTests++;
    console.log();

    // Test 3: MongoDB Connection
    const mongoDBTestPassed = await testMongoDBConnection();
    if (mongoDBTestPassed) passedTests++;
    console.log();

    // Test 4: Complete Chat Flow
    const chatFlowTestPassed = await testCompleteChatFlow();
    if (chatFlowTestPassed) passedTests++;
    console.log();

    // Summary
    console.log('📋 Test Summary:');
    console.log(`   Passed: ${passedTests}/${totalTests} tests`);

    if (passedTests === totalTests) {
        console.log('   🎉 All tests passed! Backend is ready.');
    } else {
        console.log('   ⚠️  Some tests failed. Please check the errors above.');
    }

    process.exit(passedTests === totalTests ? 0 : 1);
};


runAllTests();


export {
    testEnhancedCTA,
    testTogetherAIConnection,
    testMongoDBConnection,
    testCompleteChatFlow,
    runAllTests
};