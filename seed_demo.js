const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Company = require('./models/Company');
const Employee = require('./models/Employee');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Message = require('./models/Message');

dotenv.config();

const seedDemoData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        // 1. Clear existing demo data
        const demoEmail = 'demo@flowsense.com';
        const demoCompanyCode = 'DEMO2026';
        
        const existingCompany = await Company.findOne({ email: demoEmail });
        if (existingCompany) {
            console.log('Removing old demo data...');
            await Company.deleteOne({ _id: existingCompany._id });
            await Employee.deleteMany({ company_id: existingCompany._id });
            await Project.deleteMany({ company_id: existingCompany._id });
            await Task.deleteMany({ company_id: existingCompany._id });
            await Message.deleteMany({ senderId: existingCompany._id }); // Simple cleanup
        }

        // 2. Create Demo Company
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        const company = await Company.create({
            company_name: 'FlowSense Demo Corp',
            email: demoEmail,
            password: '123456', // Will be hashed by pre-save hook
            industry: 'Technology',
            company_code: demoCompanyCode,
            billing: {
                plan: 'Enterprise',
                status: 'Active'
            }
        });
        console.log('Demo Company Created.');

        // 3. Create Team Members
        const employeesData = [
            { name: 'Arjun Mehta', email: 'arjun@flowsense.com', role: 'Developer', skills: ['React', 'Node.js', 'TypeScript'], workload_percentage: 130, efficiency: 95 },
            { name: 'Priya Sharma', email: 'priya@flowsense.com', role: 'Designer', skills: ['Figma', 'UI/UX', 'CSS'], workload_percentage: 85, efficiency: 110 },
            { name: 'Rahul Verma', email: 'rahul@flowsense.com', role: 'Developer', skills: ['Python', 'Django', 'MongoDB'], workload_percentage: 40, efficiency: 88 },
            { name: 'Sarah Connor', email: 'sarah@flowsense.com', role: 'DevOps', skills: ['Docker', 'AWS', 'CI/CD'], workload_percentage: 70, efficiency: 105 },
            { name: 'David Miller', email: 'david@flowsense.com', role: 'Tester', skills: ['Selenium', 'Jest', 'QA'], workload_percentage: 20, efficiency: 92 },
            { name: 'Vedika Iyer', email: 'vedika@flowsense.com', role: 'Product Manager', skills: ['Agile', 'Strategy', 'Analytics'], workload_percentage: 60, efficiency: 115 }
        ];

        const createdEmployees = await Promise.all(employeesData.map(emp => 
            Employee.create({ ...emp, password: 'password123', company_id: company._id })
        ));
        console.log(`${createdEmployees.length} Team Members Created.`);

        // 4. Create a Project
        const arjun = createdEmployees.find(e => e.name === 'Arjun Mehta');
        const vedika = createdEmployees.find(e => e.name === 'Vedika Iyer');

        const project = await Project.create({
            name: 'Phoenix Smart Match',
            description: 'Implementing AI-driven resource allocation for enterprise teams.',
            deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
            priority: 'High',
            team_lead: vedika._id,
            team_members: createdEmployees.map(e => e._id),
            company_id: company._id,
            status: 'Active',
            required_skills: ['React', 'Node.js', 'AI', 'UI/UX'],
            progress: 65
        });
        console.log('Demo Project Created.');

        // 5. Create Tasks
        const tasksData = [
            { 
                name: 'API Core Integration', 
                description: 'Connect the recommendation engine to the main dashboard.',
                required_skills: ['Node.js', 'MongoDB'],
                deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (Delayed)
                hours: 24,
                assigned_to: arjun._id,
                project_id: project._id,
                company_id: company._id,
                priority: 'High',
                status: 'In Progress'
            },
            { 
                name: 'UI Components Design', 
                description: 'Build the glassmorphism card components.',
                required_skills: ['Figma', 'CSS'],
                deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                hours: 16,
                assigned_to: createdEmployees.find(e => e.name === 'Priya Sharma')._id,
                project_id: project._id,
                company_id: company._id,
                priority: 'Medium',
                status: 'Completed'
            },
            { 
                name: 'Beta Testing Phase 1', 
                description: 'Manual regression testing for the auth flow.',
                required_skills: ['QA', 'Jest'],
                deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                hours: 40,
                assigned_to: createdEmployees.find(e => e.name === 'David Miller')._id,
                project_id: project._id,
                company_id: company._id,
                priority: 'Low',
                status: 'Pending'
            },
            { 
                name: 'Performance Optimization', 
                description: 'Improve database query latency for the optimizer.',
                required_skills: ['MongoDB', 'Node.js'],
                deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                hours: 12,
                assigned_to: arjun._id, // Adding more work to Arjun (Overloaded)
                project_id: project._id,
                company_id: company._id,
                priority: 'High',
                status: 'In Progress'
            },
            // Tasks for Vedika (Team Lead Demo)
            { 
                name: 'Product Roadmap Alignment', 
                description: 'Align the Q3 roadmap with the new AI matching engine capabilities.',
                required_skills: ['Strategy', 'Agile'],
                deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                hours: 8,
                assigned_to: vedika._id,
                project_id: project._id,
                company_id: company._id,
                priority: 'High',
                status: 'Completed'
            },
            { 
                name: 'Resource Allocation Review', 
                description: 'Analyze current team workload and prepare for rebalancing session.',
                required_skills: ['Analytics', 'Project Management'],
                deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
                hours: 4,
                assigned_to: vedika._id,
                project_id: project._id,
                company_id: company._id,
                priority: 'High',
                status: 'In Progress'
            },
            { 
                name: 'Stakeholder Beta Presentation', 
                description: 'Prepare the slide deck for the Phoenix Smart Match beta reveal.',
                required_skills: ['Communication', 'Strategy'],
                deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
                hours: 10,
                assigned_to: vedika._id,
                project_id: project._id,
                company_id: company._id,
                priority: 'Medium',
                status: 'Pending'
            }
        ];

        await Task.insertMany(tasksData);
        console.log('Demo Tasks Created.');

        // 6. Create Chat Messages
        const messagesData = [
            {
                projectId: project._id,
                senderId: vedika._id,
                senderModel: 'Employee',
                senderName: 'Vedika Iyer',
                senderRole: 'Product Manager',
                message: 'Team, we need to push the API integration by EOD. Arjun, any blockers?',
                chatType: 'project'
            },
            {
                projectId: project._id,
                senderId: arjun._id,
                senderModel: 'Employee',
                senderName: 'Arjun Mehta',
                senderRole: 'Developer',
                message: 'Working on the Node.js middleware. I might need help with the MongoDB aggregation pipeline.',
                chatType: 'project'
            },
            {
                projectId: project._id,
                senderId: company._id,
                senderModel: 'Company',
                senderName: 'System Monitor',
                senderRole: 'Company',
                message: 'ALERT: Arjun Mehta has exceeded 120% workload. Please consider reassigning tasks.',
                chatType: 'project',
                messageType: 'Update'
            }
        ];

        await Message.insertMany(messagesData);
        console.log('Demo Messages Created.');

        console.log('--- SEEDING COMPLETE ---');
        console.log(`Email: ${demoEmail}`);
        console.log(`Password: 123456`);
        console.log(`Company Code: ${demoCompanyCode}`);

        process.exit();
    } catch (err) {
        console.error('Seeding Error:', err);
        process.exit(1);
    }
};

seedDemoData();
