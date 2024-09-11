import React from "react";

interface InputProps {
    value: string;
    type: string;
    changeValue: (value: string) => void;
    label: string;
    placeholder: string;
}

/**
 *
 * @param props value: string to be displayed in the input
 * @param props type: type of input
 * @param props changeValue: function to be called when the input is changed
 * @param props label: label of the input
 * @param props placeholder: placeholder of the input
 *
 * @returns a input component configured with the given props
 */

const DateInput: React.FC<InputProps> = (props) => {
    return (
        <div className="DateInputContainer">
            <p className="DateText">Lock Time : </p>
            <input
                type={props.type}
                placeholder={props.placeholder}
                value={props.value}
                onChange={(e) => props.changeValue(e.target.value)}
                style={{border: '1px solid'}}
            />
        </div>
    );
};

export default DateInput;