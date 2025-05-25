import React, { useRef, useState } from 'react';
function EditableNode({
  id,
  data,
  selected,
  setNodes
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(data.label);
  const inputRef = useRef();
  React.useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);
  const getFontSize = text => {
    if (text.length < 12) return 16;
    if (text.length < 20) return 14;
    if (text.length < 32) return 12;
    if (text.length < 48) return 10;
    return 9;
  };
  const handleDoubleClick = e => {
    e.stopPropagation();
    setEditing(true);
  };
  const handleBlur = () => {
    setEditing(false);
    setNodes(nds => nds.map(n => n.id === id ? {
      ...n,
      data: {
        ...n.data,
        label: value
      }
    } : n));
  };
  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setEditing(false);
      setNodes(nds => nds.map(n => n.id === id ? {
        ...n,
        data: {
          ...n.data,
          label: value
        }
      } : n));
    }
  };
  React.useEffect(() => {
    setValue(data.label);
  }, [data.label]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: selected ? '0 0 0 4px #FFA50088' : undefined,
      outline: selected ? '2px solid #FFA500' : undefined,
      outlineOffset: selected ? 2 : undefined,
      borderRadius: 6,
      transition: 'box-shadow 0.15s, outline 0.15s',
      background: selected ? '#fffbe6' : undefined,
      padding: 8
    },
    onDoubleClick: handleDoubleClick
  }, editing ? /*#__PURE__*/React.createElement("input", {
    ref: inputRef,
    value: value,
    onChange: e => setValue(e.target.value),
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
    style: {
      width: '90%',
      fontSize: getFontSize(value),
      fontWeight: 600,
      border: '1px solid #FFA500',
      borderRadius: 4,
      padding: '2px 6px',
      outline: 'none',
      background: '#fff',
      color: '#222',
      textAlign: 'center'
    },
    maxLength: 64
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: getFontSize(data.label),
      fontWeight: 600,
      color: '#222',
      width: '100%',
      textAlign: 'center',
      wordBreak: 'break-word',
      userSelect: 'none',
      cursor: 'pointer',
      whiteSpace: 'pre-line',
      lineHeight: 1.2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
      overflowWrap: 'break-word'
    }
  }, data.label));
}
export default EditableNode;