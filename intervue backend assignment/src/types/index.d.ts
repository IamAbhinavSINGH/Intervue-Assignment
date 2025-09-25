export interface Student{
    socketId : string;
    name : string;
    clientId?: string;
    id? : string;
}

export interface Teacher{
    id : string;
    token : string;
    socketId : string;
}

export interface LiveQuestion{
    id : string;
    text : string;
    options : {
        id : string;
        text : string;
        isCorrect : boolean;
    }[];
    timeLimit : number;
    startedAt : number;
    responses : Map<string , string> // clientId -> OptionId
}

export interface RoomRuntime{
    code : string;
    teacher : Teacher;
    students : Map<string , student>;
    questions : LiveQuestion[];
    activeQuestion? : LiveQuestion
}

