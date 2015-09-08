### About
The Learning Analytics Reflection and Awareness Dashboard (LARAe) is the central spot for students and teachers to access information on the analytics data of the students' activities in the weSPOT environment. It is developed using the latest web technologies (d3.js, HTML5, Node.js). 

### Architecture
Users can access the dashboard through a link in the sidebar of the inquiry, available in the weSPOT Inquiry Workflow Engine. This presents the user with a new browser window containing the LARAe dashboard. The dashboard itself is connected to a Node.js server which fetches the event data of the specific inquiry from the Data Store. This event data is collected and parsed, enriched with the user rating information and visualised per inquiry phase and student.

Accessing the events shows a preview of the data: for text-based data the information is fetched from the Data Store. For media such as videos and images, the ARLearn environment is accessed. Every event contains a link to the original data e.g. an activity in the Inquiry Workflow Engine will contain a link to the activity within the widget.
