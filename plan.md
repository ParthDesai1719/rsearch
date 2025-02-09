To add the Deep Search feature to your rsearch project, we can follow a structured plan that ensures the implementation is efficient, maintainable, and keeps the repository size under 500 Lines of Code (LoC). Below is the proposed plan:

1. Understand the Current Codebase
Review Existing Files: Analyze the provided app/page.tsx, app/rsearch/page.tsx, and components/rSearch/query.tsx to understand the current structure and functionality.
Identify Integration Points: Determine where the Deep Search feature will integrate within the existing components and pages.
2. Define Feature Requirements
Functional Specifications:
Iterative Research: Ability to perform deep, iterative research based on user queries.
Intelligent Query Generation: Utilize Large Language Models (LLMs) to generate and refine search queries.
Depth & Breadth Control: Configurable parameters to control research depth and breadth.
Smart Follow-up: Generate follow-up questions for better research refinement.
Comprehensive Reports: Generate detailed markdown reports of findings.
Concurrent Processing: Handle multiple searches and process results in parallel.
Technical Specifications:
API Integrations: Firecrawl API for web search and content extraction, OpenAI API for LLM functionalities.
Environment Variables: Manage API keys securely using .env.local.
User Interface: Extend existing UI components to accommodate new functionalities.
3. Design the Architecture
Component Structure:
DeepSearchComponent: New React component to handle Deep Search functionalities.
API Routes: Create new API endpoints if necessary for handling Deep Search operations.
State Management: Utilize React hooks to manage the state of Deep Search processes.
Flow Overview:
User Input: User enters a research query with specified breadth and depth.
Query Generation: LLM generates targeted search queries based on user input.
Search Execution: Firecrawl API executes the search queries.
Result Processing: Extract key learnings and generate follow-up directions.
Recursive Exploration: Based on depth, repeat the process with new directions.
Report Generation: Compile findings into a markdown report.
4. Develop the Feature
Step 1: Setup Environment Variables
Ensure .env.local has the necessary API keys (FIRECRAWL_KEY, OPENAI_KEY).
Step 2: Create DeepSearchComponent
Develop a new component within components/rSearch/ to manage Deep Search interactions.
Incorporate UI elements for:
Input fields for query, breadth, and depth.
Displaying iterative research progress.
Showing the final markdown report.
Step 3: Implement API Integrations
Firecrawl API: Handle web searches and content extraction.
OpenAI API: Manage LLM interactions for query refinement and follow-up questions.
Ensure asynchronous handling for concurrent processing.
Step 4: Manage State and Data Flow
Utilize React hooks (useState, useEffect) to manage the Deep Search state.
Store intermediate findings and directions.
Step 5: Generate Markdown Reports
Use a markdown library or custom functions to compile findings into output.md.
Step 6: Optimize for LoC Constraint
Keep the implementation modular and concise.
Reuse existing components where possible.
Avoid unnecessary dependencies.
5. Update Existing Components
app/page.tsx:
Add navigation or links to access the Deep Search feature.
app/rsearch/page.tsx:
Integrate the DeepSearchComponent to provide a seamless user experience.
components/rSearch/query.tsx:
Enhance the query handling to support Deep Search parameters.
6. Testing
Unit Tests: Write tests for new components and API integrations to ensure functionality.
Integration Tests: Ensure Deep Search interacts correctly with existing features.
User Acceptance Testing: Validate the feature from a user's perspective.
7. Documentation
Update README.md:
Document the Deep Search feature, setup instructions, and usage guidelines.
Code Comments: Add comments to new code segments for clarity.
8. Deployment
Ensure Environment Variables: Confirm .env.local is correctly set up in the deployment environment.
Monitor Performance: After deployment, monitor the feature for any issues or performance bottlenecks.
9. Feedback and Iteration
Gather User Feedback: Post-deployment, collect feedback to identify areas of improvement.
Iterate: Refine the feature based on feedback and testing results.
Timeline Estimate
Week 1: Requirement analysis, architecture design, and initial setup.
Week 2-3: Development of the Deep Search component and API integrations.
Week 4: Testing, documentation, and deployment.
Dependencies and Considerations
API Rate Limits: Be mindful of Firecrawl and OpenAI API rate limits; implement error handling.
Performance Optimization: Ensure concurrent processing does not lead to performance degradation.
Security: Securely manage API keys and sensitive data.
By following this plan, we can systematically implement the Deep Search feature, ensuring it integrates smoothly with the existing rsearch project while maintaining codebase simplicity and efficiency.

When you're ready to proceed with the implementation, please switch to Act Mode to begin executing the plan.