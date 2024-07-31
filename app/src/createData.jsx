import React from 'react';
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { createData } from './function';
import Spinner from 'react-bootstrap/Spinner';


function CreateData() {
    const { register, control, handleSubmit, formState: { errors } } = useForm();
    const [isUploading, setIsUploading] = useState(false);
    const [dataFrom, setDataFrom] = useState(1);
    const [textareaContent, setTextareaContent] = useState('');



    const handleDataFrom = (e) => {
        setDataFrom(e.target.value);
    };

    const { fields, append, remove } = useFieldArray({
        control,
        name: "headers"
    });

    // Función para agregar un nuevo header
    const addHeader = () => {
        append({ value: "" });
    };

    // Función para agregar un nuevo textarea
    const addTextarea = () => {
        if (textareaContent === '') {
            setTextareaContent('{"value": "", "type": "", "range": ""}');
        }
    };

    // Renderiza los textareas dinámicos
    const renderTextarea = () => {
        if (textareaContent !== '') {
            return (
                <>
                    <textarea
                        value={textareaContent}
                        onChange={(event) => setTextareaContent(event.target.value)}
                        className="form-control"
                        placeholder='Insert headers in JSON format like this: {"value": "", "type": "", "range": ""}'
                    />
                    <button className="btn btn-danger mt-1" onClick={() => setTextareaContent('')}>Remove Textarea</button>
                </>
            );
        }
        return null;
    };

    // Renderiza los inputs para cada header y un botón para eliminar
    const dataHeaders = fields.map((field, index) => (
        <div key={field.id}>
            <input
                {...register(`headers.${index}.value`, { required: true })}
                className={`form-control ${errors.headers && errors.headers[index]?.value ? 'is-invalid' : ''} m-2`}
            />
            <button type="button" className="btn btn-danger ms-1" onClick={() => remove(index)}>Remove</button>
            <select
                {...register(`headers.${index}.type`, { required: true })}
                className='btn btn-dark ms-1'
            >
                <option value="number">Number</option>
                <option value="string">String</option>
                <option value="date">Date</option>
                <option value="boolean">Boolean</option>
            </select>
            <input
                {...register(`headers.${index}.range`, { required: true })}
                className={`btn btn-dark  ${errors.headers && errors.headers[index]?.value ? 'is-invalid' : ''} m-2`}
                placeholder='Range'
                type='text'
                style={{ width: '100px' }}
            />
        </div>
    ));


    const onSubmit = data => {
        setIsUploading(true);
        let headers = [];
        if (textareaContent !== '') {
            headers = parseTextareaContent(textareaContent);
        } else {
            headers = data.headers.map(header => ({ value: header.value, type: header.type, range: header.range }));
        }
        const object = {
            file: data.file[0],
            numbersOfRecords: data.numbersOfRecords,
            headers: headers,
            period: data.period,
            check: data.check
        };
        console.log(object);
        createData(object, () => {}, () => { setIsUploading(false); });
    };

    // Function to parse the textarea content into an array of objects
    function parseTextareaContent(text) {
        try {
            let validJsonString = text.replace(/(\w+):/g, '"$1":');
            validJsonString = validJsonString.replace(/:([^,"{}]+)(,|})/g, (match, p1, p2) => {
                let trimmedValue = p1.trim();
                if (!trimmedValue.startsWith('"')) {
                    trimmedValue = `"${trimmedValue}"`;
                }
                return `:${trimmedValue}${p2}`;
            });

            const parsedArray = JSON.parse(`[${validJsonString}]`);
            return parsedArray;
        } catch (error) {
            console.error("Error parsing textarea content:", error);
            return [];
        }
    }

    return (
        <div className="container mt-5">
            <h1 className="my-4 text-center">Create Data</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className='mb-3'>
                    <label htmlFor="name" className="form-label">How do you want create the data ?</label>
                    <select className="form-select" aria-label="Default select example" {...register('name', { required: true })} onChange={handleDataFrom} >
                        <option value="1">Repeat Data From File</option>
                        <option value="2">Random Data</option>
                    </select>
                </div>
                {dataFrom == 1 ? (
                    <div className="mb-3">
                        <label htmlFor="file" className="form-label">File</label>
                        <input
                            type="file"
                            className={`form-control ${errors.file ? 'is-invalid' : ''}`}
                            id="file"
                            {...register('file', { required: true })}
                        />
                        {errors.file && <div className="invalid-feedback">This field is required</div>}
                    </div>
                ) : (
                    <div className="mb-3">

                        {
                            dataFrom == 2 && (
                                <div className="mb-3">
                                   <label /> Insert headers in JSON format like this: {"{value: '', type: '', range: ''}"}
                                    <button className="btn btn-success m-1" onClick={addTextarea}>Add textarea</button>
                                    {renderTextarea()}
                                    <br />

                                </div>
                            )
                        }

                        <label htmlFor="headers" className="form-label">Insert headers choosing</label>
                        {dataHeaders}
                        <button className="btn btn-success m-1" onClick={addHeader}>Add Header</button>
                        {errors.headers && <div className="invalid-feedback">This field is required</div>}
                    </div>

                )}
                <div className="mb-3">
                    <label htmlFor="numbersOfRecords" className="form-label">Expected Numbers of Records</label>
                    <input
                        type="number"
                        className={`form-control ${errors.numbersOfRecords ? 'is-invalid' : ''}`}
                        id="numbersOfRecords"
                        {...register('numbersOfRecords', { required: true })}
                    />
                    {errors.numbersOfRecords && <div className="invalid-feedback">This field is required</div>}
                </div>


                <div className="mb-3">
                    <label htmlFor="period" className="form-label">Period</label>
                    <select
                        {...register('period', { required: true })}
                        className='btn btn-dark ms-1'
                    >
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Mounthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Annually">Annually</option>
                    </select>
                    {errors.numbersOfRecords && <div className="invalid-feedback">This field is required</div>}
                </div>
                <div className="mb-3">
                    <label htmlFor='check' className='form-label'>Do you want to pass the data directly to DB ? </label>
                    <br />
                    <input style={{ width: '20px', height: '20px' }}
                        type='checkbox'
                        id='check'
                        {...register('check',)} />
                </div>
                {/* BOTON PARA ENVAR LOS DATOS */}
                <button type="submit" className="btn btn-primary">Submit</button>
            </form>
            <hr />
            {isUploading ? <Spinner animation="border" /> : null}
            <p style={{ fontSize: '16px' }} >@By Daniel UL</p>
        </div>
    );
};

export default CreateData;