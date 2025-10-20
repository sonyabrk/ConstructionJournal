import { useState } from 'react';
import type { Task as GanttTask } from 'gantt-task-react';
import { Gantt, ViewMode } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";

const MyGanttChart = () => {
    const [tasks] = useState<GanttTask[]>([
        {
            start: new Date(2025, 0, 1),
            end: new Date(2025, 0, 15),
            name: "Работа 1",
            id: "1",
            type: "task",
            progress: 45,
        },
        {
            start: new Date(2025, 0, 10),
            end: new Date(2025, 0, 20),
            name: "Работа 2",
            id: "2",
            type: "task",
            progress: 20,
        },
        {
            start: new Date(2025, 0, 15),
            end: new Date(2025, 0, 20),
            name: "Работа 3",
            id: "3",
            type: "task",
            progress: 10,
        },
        {
            start: new Date(2025, 0, 22),
            end: new Date(2025, 0, 25),
            name: "Работа 4",
            id: "4",
            type: "task",
            progress: 0,
        }
    ]);

    return (
        <div style={{
            width: '100%',
            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
        }}>
            <Gantt
                tasks={tasks}
                viewMode={ViewMode.Day}
                onDateChange={console.log}
                onProgressChange={console.log}
                locale="ru"
                listCellWidth=""
                columnWidth={80}
            />
        </div>
    );
};

export default MyGanttChart;