/*
    {
        "img":  
        "pdf" : 
        "doi" : 
        "demo": 
        "title":
        "abstract":
    }
*/

research=[

    //mobiot
    {
        "img":  "data/images/research/mobiot/1.jpg",
        "pdf" : "https://dl.acm.org/doi/pdf/10.1145/3491102.3517645?casa_token=jGhl8A90TdwAAAAA:eyQGuWLXzvRzvBv8nrGlqQAzhFbIDTTt4g2sDpa8zN8JGnkN8sWw6_iYoud2ohyxkUEgWHYXxK4t",
        "doi" : "https://doi.org/10.1145/3491102.3517645",
        "demo": "https://youtu.be/uX7m3bPknnI",
        "title":"Mobiot: Augmenting Everyday Objects into Moving IoT Devices Using 3D Printed Attachments Generated by Demonstration",
        "abstract":"Recent advancements in personal fabrication have brought novices closer to a reality, where they can automate routine tasks with mobilized everyday objects. However, the overall process remains challenging- from capturing design requirements and motion planning to authoring them to creating 3D models of mechanical parts to programming electronics, as it demands expertise. We introduce Mobiot, an end-user toolkit to help non-experts capture the design and motion requirements of legacy objects by demonstration. It then automatically generates 3D printable attachments, programs to operate assembled modules, a list of off-the-shelf electronics, and assembly tutorials. The authoring feature further assists users to fine-tune as well as to reuse existing motion libraries and 3D printed mechanisms to adapt to other real-world objects with different motions. We validate Mobiot through application examples with 8 everyday objects with various motions applied, and through technical evaluation to measure the accuracy of motion reconstruction."
    },

    //siggraph asia 22
    {
        "img":   "data/images/research/siggraph22/1.jpg",
        "pdf" : "https://dl.acm.org/doi/pdf/10.1145/3550471.3564763?casa_token=QIeMAOBrzlIAAAAA:7zhrzcONpnlJ2a_4hI_fCYjxO1Ze37193VPkUCCgcmKpVd0uL4NPyY41lRo8XtRnBFtgUNMsoZ_-",
        "doi" : "https://doi.org/10.1145/3550471.3564763",
        "demo": "https://youtu.be/ukiDROPVT0g",
        "title": "Augmenting Everyday Objects into Personal Robotic Devices",
        "abstract": "Augmenting familiar physical objects has presented great potential in upgrading their functions by automation, granting aesthetics, and even changing access. The recent celebration of success in personal fabrication has brought novices where they can augment everyday objects, from automating routine tasks with mobilized smart devices to devising self-sustaining smart objects by harvesting energy from involved daily interactions, for example. While the overall process involves a line of steps of capturing specifications, design mechanisms and fabricating the parts, it remains challenging for non-experts as it demands domain expertise in robotics, design, programming, and even mechanical engineering. We introduce a series of augmented robots, smart domestic devices that are augmented from everyday objects, leveraging personal fabrication to assist daily essential interactions. Through user-demonstration of desired motions, 3D printed attachment mechanisms are auto-generated to build personal robotic devices that automate routine tasks and harvest energy."
    },

    //autonomous rover
    {
        "img":  "data/images/research/rover1/1.jpg",
        "pdf" : "https://uksim.info/ams2017/CD/data/3752a089.pdf",
        "doi" : "https://doi.org/10.1109/AMS.2017.22",
        
        "title": "Autonomous Rover Navigation Using GPS Based Path Planning",
        "abstract":"Nowadays, with the constant evolution of Artificial Intelligence and Machine Learning, robots are getting more perceptive than ever. For this quality they are being used in varying circumstances which humans cannot control. Rovers are special robots, capable of traversing through areas that are too difficult for humans. Even though it is a robust bot, lack of proper intelligence and automation are its basic shortcomings. As the main purpose of a rover is to traverse through areas of extreme difficulties, therefore an intelligent path generation and following system is highly required. Our research work aimed at developing an algorithm for autonomous path generation using GPS (Global Positioning System) based coordinate system and implementation of this algorithm in real life terrain, which in our case is MDRS, Utah, USA. Our prime focus was the development of a robust but easy to implement system. After developing such system, we have been able to successfully traverse our rover through that difficult terrain. It uses GPS coordinates of target points that will be fed into the rover from a control station. The rover capturing its own GPS signal generates a path between the current location and the destination location on its own. It then finds the deviation in its current course of direction and position. And eventually it uses Proportional Integral Derivative control loop feedback mechanism (PID control algorithm) for compensating the error or deviation and thus following that path and reach destination. A low cost on board computer (Raspberry Pi in our case) handles all the calculations during the process and drives the rover fulfilling its task using an microcontroller (Arduino)."
    },

    //vertex
    {
        "img":  "data/images/research/vertex/1.jpg",
        "pdf" : "https://ieeexplore.ieee.org/iel7/7932712/7935023/07935038.pdf?casa_token=YAbE62EaY_AAAAAA:FHNLxgBUu3iR0oshGAYP8_VXZBgv6Y1YIw_-b1xZElhRoeTQ7dkgAGop44xBb8SMf1G7_FSj",
        "doi" : "https://doi.org/10.1109/ICCRE.2017.7935038",

        "title": "2D mapping and vertex finding method for path planning in autonomous obstacle avoidance robotic system",
        "abstract": "This work proposes a method for continuous navigation and path planning to avoid obstacles for both indoor and outdoor application. The navigating robot creates 2D map of the traversed area. To avoid collision with obstacles, the robot uses range measurement sensors. The Robot autonomously moves around the unexplored environment safely, detects obstacles through radar vision, collects data, transmits data through wireless module to host computer where the host computer detects suitable path for traversal and navigates the robot from a remote location. Simultaneously, the host computer constructs a 2D map and planes navigation from the field robots collected data."
    }
];

