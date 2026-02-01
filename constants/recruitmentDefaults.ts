export const DEFAULT_ROLES_DATA = [
    {
        roleName: "Web Developer",
        description: "Build and maintain websites and web applications.",
        fields: [
            { name: "technologies", label: "Technologies known", type: "text", required: true, placeholder: "React, Node.js, etc." },
            { name: "projects", label: "Project Links", type: "url", required: false, placeholder: "GitHub or Live links" },
            { name: "learning", label: "What do you want to learn?", type: "textarea", required: false, placeholder: "" },
            { name: "featureSuggestion", label: "Feature Suggestion for GDG Site", type: "textarea", required: false, placeholder: "" }
        ]
    },
    {
        roleName: "App Developer",
        description: "Develop mobile applications using Flutter or React Native.",
        fields: [
            { name: "technologies", label: "Technologies known", type: "text", required: true, placeholder: "Flutter, React Native, Kotlin, Swift" },
            { name: "projects", label: "Project Links", type: "url", required: false, placeholder: "GitHub or Store links" },
            { name: "learning", label: "What do you want to learn?", type: "textarea", required: false, placeholder: "" },
            { name: "featureSuggestion", label: "Feature Suggestion for GDG App", type: "textarea", required: false, placeholder: "" }
        ]
    },
    {
        roleName: "Machine Learning",
        description: "Work on AI/ML projects and workshops.",
        fields: [
            { name: "technologies", label: "Frameworks/Tools", type: "text", required: true, placeholder: "TensorFlow, PyTorch, Scikit-learn" },
            { name: "projects", label: "Project Links", type: "url", required: false, placeholder: "Kaggle or GitHub links" },
            { name: "learning", label: "Areas of interest", type: "textarea", required: false, placeholder: "NLP, Computer Vision, etc." }
        ]
    },
    {
        roleName: "Tech Member",
        description: "General technical role for enthusiasts.",
        fields: [
            { name: "technologies", label: "Technologies known", type: "text", required: true, placeholder: "Languages, tools, etc." },
            { name: "learning", label: "What do you want to learn?", type: "textarea", required: true, placeholder: "" }
        ]
    },
    {
        roleName: "Public Relations",
        description: "Manage communications and outreach.",
        fields: [
            { name: "mockPost", label: "Write a mock social media post for an event", type: "textarea", required: true, placeholder: "Draft a caption..." },
            { name: "experience", label: "Prior Experience", type: "textarea", required: false, placeholder: "" },
            { name: "preferredPlatforms", label: "Preferred Social Media Platforms", type: "text", required: true, placeholder: "Instagram, LinkedIn, Twitter..." }
        ]
    },
    {
        roleName: "Video Editor",
        description: "Edit videos for events and promotions.",
        fields: [
            { name: "tools", label: "Editing Tools", type: "text", required: true, placeholder: "Premiere Pro, DaVinci Resolve, CapCut..." },
            { name: "videoLink", label: "Best Video Edit Link", type: "url", required: true, placeholder: "Drive link or YouTube link" },
            { name: "motionGraphics", label: "Motion Graphics Experience", type: "text", required: false, placeholder: "After Effects, etc." }
        ]
    },
    {
        roleName: "Content Writer",
        description: "Write blogs, captions, and newsletters.",
        fields: [
            { name: "hasWrittenBefore", label: "Have you written content before?", type: "textarea", required: true, placeholder: "Share links or experiences..." }
        ]
    },
    {
        roleName: "Graphics Designer",
        description: "Design posters and assets.",
        fields: [
            { name: "designTools", label: "Design Tools", type: "text", required: true, placeholder: "Figma, Canva, Photoshop, Illustrator..." },
            { name: "portfolioLink", label: "Portfolio Link", type: "url", required: true, placeholder: "Behance, Dribbble, or Drive link" },
            { name: "socialMediaDesign", label: "Experience with Social Media Design", type: "textarea", required: false, placeholder: "" },
            { name: "eventPosterConcept", label: "Describe an event poster concept", type: "textarea", required: false, placeholder: "" }
        ]
    },
    {
        roleName: "Photographer",
        description: "Capture moments at events.",
        fields: [
            { name: "photographyType", label: "Type of Photography", type: "text", required: true, placeholder: "Portrait, Event, Street..." },
            { name: "eventExperience", label: "Event Photography Experience", type: "textarea", required: false, placeholder: "" },
            { name: "photographyPortfolio", label: "Portfolio Link", type: "url", required: true, placeholder: "Instagram or Drive link" },
            { name: "cameraModel", label: "Camera Model (if any)", type: "text", required: false, placeholder: "" }
        ]
    }
];
