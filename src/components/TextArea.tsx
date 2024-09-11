import React from 'react';
import '../styles/Input.css'

interface TextAreaProps {
  value: string;
  rows: number;
  changeValue: (value: string) => void;
  placeholder: string;
}

/**
 *
 * @param props value: string to be displayed in the textarea
 * @param props rows: number of rows for the textarea
 * @param props changeValue: function to be called when the textarea is changed
 * @param props placeholder: placeholder text for the textarea
 *
 * @returns a textarea component configured with the given props
 */

const TextArea: React.FC<TextAreaProps> = props => {
  return (
   <div className="TextAreaContainer">
     <textarea style={{ width: '100%' }}
       className='TextArea'
       rows={props.rows}
       placeholder={props.placeholder}
       value={props.value}
       onChange={e => props.changeValue(e.target.value)}
       required
     />
   </div>
  );
};

export default TextArea;