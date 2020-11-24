import { Button, Dropdown, Form, Menu, Modal, Select, Spin } from 'antd';
import { FormInstance } from 'antd/lib/form';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { IFeedbackStep, IScript, ITimerStep, IUpdateSetPointStep, IWaitForSetPointStep, StepTypeEnum } from '../../models/IScript';
import { RootState } from '../../store/reducers/rootReducer';
import { deleteScript, runScript, saveScript } from '../../store/reducers/scriptReducer';
import { AppDispatch } from '../../store/store';
import { Droppable, Draggable, DragDropContext } from 'react-beautiful-dnd';
import { Guid } from 'guid-typescript';

import './scripts.less';
import { Step } from '../../components/Step';

const ScriptsPage: FC = () => {
  const tuning = useSelector<RootState, boolean>(state => state.enail.state?.tuning || false);
  const scriptRunning = useSelector<RootState, boolean>(state => state.enail.state?.scriptRunning || false);
  const loading = useSelector<RootState, boolean>(state => state.scripts.loading);
  const requesting = useSelector<RootState, boolean>(state => state.scripts.requesting);
  const script = useSelector<RootState, string | undefined>(state => state.scripts.currentScript);
  const scripts = useSelector<RootState, IScript[]>(state => state.scripts.scripts);
  const [currentScript, setCurrentScript] = useState(scripts.find(s => s.key === script));
  const [openKey, setOpenKey] = useState<string|undefined>(undefined);
  const [t] = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const formRef = useRef<FormInstance>();

  useEffect(() => {
    if (script && script !== currentScript?.key) {
      const scriptObj = scripts.find(s => s.key === script);
      setCurrentScript(scriptObj);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [script]);
  
  const selectedOnChange = (key: string) => {
    if (key === Guid.EMPTY) {
      setCurrentScript({
        key: Guid.createEmpty().toString(),
        title: 'New',
        rootStep: {
          type: StepTypeEnum.SequentialStep,
          key: Guid.create().toString(),
          loop: 1,
          steps: [],
        },
      });
      return;
    }
    const scriptObj = scripts.find(s => s.key === key);
    setCurrentScript(scriptObj);
  };

  const onSaveScript = async () => {
    Modal.confirm({
      title: t('scripts.updateConfirm', 'Update Script?'),
      content: t('scripts.updateConfirmContent', 'Do you want to update the script: {{script}}?', { script: currentScript?.title }),
      onOk: async () => {
        if (!currentScript) {
          return;
        }
        const result = await dispatch(saveScript({
          ...currentScript,
        } as IScript));  
        if (result.error) {
          Modal.error({
            title: t('scripts.save.error.title', 'Error'),
            content: t('scriptss.save.error.content', 'An error occured saving the script: {{script}}', { script: currentScript.title }),
          });
        } else {
          Modal.info({
            title: t('scripts.savesuccess.title', 'Success'),
            content: t('scripts.savesuccess.content', 'Successfully saved the script: {{script}}', { script: currentScript.title }),
          });
        }
      },
    });
  };

  const onDeleteScript = async () => {
    if (!currentScript) {
      return;
    }
    Modal.confirm({
      title: t('scripts.deleteScript.confirm.title', 'Delete Script?'),
      content: t('scripts.deleteScript.confirm.content', 'Delete the {{script}} script?', { script: currentScript.title }),
      onOk: async () => {
        if (!currentScript) {
          return;
        }
        const result = await dispatch(deleteScript(currentScript.key));
        if (result.error) {
          Modal.error({
            title: t('scripts.deleteScript.error.title', 'Error Deleting Script'),
            content: t('scripts.deleteScript.error.content', 'An error occured deleting the {{script}} script.', { script: currentScript.title }),
          });
          return;
        }
        if (script) {
          setCurrentScript(scripts.find(s => s.key === script));
        }
      },
    });
  };

  const onRunScript = async () => {
    if (!currentScript) {
      return;
    }

    Modal.confirm({
      title: t('scripts.runScript.confirm.title', 'Run Script?'),
      content: t('scripts.runScript.confirm.content', 'Run the {{script}} script?', { script: currentScript.title }),
      onOk: async () => {
        if (!currentScript) {
          return;
        }
        const result = await dispatch(runScript(currentScript.key));
        if (result.error) {
          Modal.error({
            title: t('scripts.runScript.error.title', 'Error Running Script'),
            content: t('scripts.runScript.error.content', 'An error occured running the {{script}} script.', { script: currentScript.title }),
          });
          return;
        }
        if (script) {
          setCurrentScript(scripts.find(s => s.key === script));
        }
      },
    });
  };

  if (loading) {
    return <Spin />;
  }

  return <Form className="script-form" ref={ref => { if (ref) { formRef.current = ref; } }} onFinish={onSaveScript}>
    <Form.Item label={t('scripts.script', 'Script')} rules={[{ required: true }]}>
      <Select value={currentScript?.key} onChange={selectedOnChange}>
        <Select.Option key={Guid.EMPTY} value={Guid.EMPTY}>-New-</Select.Option>
        {scripts.map(p => {
          return (
            <Select.Option 
              key={p.key} value={p.key}
            >
              {p.title}{p.key === script ? t('active-tag', '(active)') : ''}
            </Select.Option>
          );
        })}
      </Select>
    </Form.Item>
    <Form.Item>
      <DragDropContext onDragEnd={result => { 
        if (!currentScript?.rootStep.steps || !result.destination) {
          return;
        }
        const saveKey = openKey;
        const newSteps = [...currentScript?.rootStep.steps];
        newSteps.splice(result.destination.index, 0, newSteps.splice(result.source.index, 1)[0]);
        setCurrentScript({
          ...currentScript,
          rootStep: {
            ...currentScript?.rootStep,
            steps: [...newSteps],
          },
        });
        setOpenKey(saveKey);
      }}>
        <Droppable droppableId="root">
          {(provided) => {
            return (
              <div 
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {
                  currentScript?.rootStep.steps.map((stepInfo, index) => {
                    return (
                      <Draggable key={`step-${index}`} index={index} draggableId={`step-${index}`}>
                        {(provided) => {
                          return (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <Step 
                                key={`step-${index}`} step={stepInfo} 
                                isOpen={stepInfo.key === openKey}
                                onChange={step => {
                                  const foundStep = currentScript.rootStep.steps.findIndex(s => s.key === step.key);
                                  if (foundStep < 0) {
                                    return;
                                  }
                                  const newSteps = [
                                    ...(foundStep > 0 ? currentScript.rootStep.steps.slice(0, foundStep) : []),
                                    step,
                                    ...(foundStep < currentScript.rootStep.steps.length - 1 ? currentScript.rootStep.steps.slice(foundStep + 1) : []),
                                  ];
                                  setCurrentScript({
                                    ...currentScript,
                                    rootStep: {
                                      ...currentScript.rootStep,
                                      steps: newSteps,
                                    },
                                  });
                                }} 
                                onOpenClose={(isOpen, key) => {
                                  if (isOpen) {
                                    setOpenKey(key);
                                  } else {
                                    setOpenKey(undefined);
                                  }
                                }}
                                onDelete={key => {
                                  setCurrentScript({
                                    ...currentScript,
                                    rootStep: {
                                      ...currentScript.rootStep,
                                      steps: currentScript.rootStep.steps.filter(s => s.key !== key),
                                    },
                                  });
                                }}
                              />
                            </div>
                          );
                        }}
                      </Draggable>
                    );
                  })
                }
              </div>
            );
          }}
        </Droppable>
      </DragDropContext>
      
    </Form.Item>

    <Form.Item className="button-row">
      <Button type="primary" htmlType="submit" disabled={requesting}>
        {t('scripts.buttonSave', 'Save')}
      </Button>
      &nbsp;
      <Button type="primary" htmlType="button" 
        hidden={!currentScript || (currentScript.key === Guid.EMPTY)}
        onClick={onRunScript}
        disabled={tuning || scriptRunning}
      >
        {t('button.run', 'Run')}
      </Button>
      &nbsp;
      <Button type="primary" htmlType="button" hidden={!currentScript || (scripts.length === 0) || (currentScript.key === Guid.EMPTY)}
        onClick={onDeleteScript}>
        {t('button.delete', 'Delete')}
      </Button>
      &nbsp;
      <Dropdown 
        placement="topRight"
        trigger={['click']}
        overlay={<Menu>
          <Menu.Item key="menu-update-sp" onClick={() => {
            console.log(JSON.stringify(currentScript, null, ' '));
            if (!currentScript) {
              return;
            }

            const newScript = {
              ...currentScript,
              rootStep: {
                ...currentScript.rootStep,
                steps: [
                  ...currentScript.rootStep.steps,
                  {
                    key: Guid.create().toString(),
                    type: StepTypeEnum.UpdateSetPointStep,
                    updateType: 'increment',
                    value: 10,
                  } as IUpdateSetPointStep,
                ],
              },
            };
            setCurrentScript(newScript);
          }}>
            {t('button.updateSP', 'Update Set Point')}
          </Menu.Item>
          <Menu.Item key="menu-wait-sp" onClick={() => {
            if (!currentScript) {
              return;
            }

            setCurrentScript({
              ...currentScript,
              rootStep: {
                ...currentScript.rootStep,
                steps: [
                  ...currentScript.rootStep.steps,
                  {
                    key: Guid.create().toString(),
                    type: StepTypeEnum.WaitForSetPointStep,
                  } as IWaitForSetPointStep,
                ],
              },
            });
          }}>
            {t('button.waitForSP', 'Wait for Set Point')}
          </Menu.Item>
          <Menu.Item key="menu-feedback" onClick={() => {
            if (!currentScript) {
              return;
            }

            setCurrentScript({
              ...currentScript,
              rootStep: {
                ...currentScript.rootStep,
                steps: [
                  ...currentScript.rootStep.steps,
                  {
                    key: Guid.create().toString(),
                    type: StepTypeEnum.FeedbackStep,
                  } as IFeedbackStep,
                ],
              },
            });
          }}>
            {t('button.feedback', 'Feedback')}
          </Menu.Item>
          <Menu.Item key="menu-timer" onClick={() => {
            if (!currentScript) {
              return;
            }

            setCurrentScript({
              ...currentScript,
              rootStep: {
                ...currentScript.rootStep,
                steps: [
                  ...currentScript.rootStep.steps,
                  {
                    key: Guid.create().toString(),
                    type: StepTypeEnum.TimerStep,
                    duration: 5,
                  } as ITimerStep,
                ],
              },
            });
          }}>
            {t('button.timer', 'Timer')}
          </Menu.Item>
        </Menu>
        }
      >
        <Button type="primary" htmlType="button">{t('button.addstep', 'Add Step')}</Button>
      </Dropdown>
      &nbsp;
    </Form.Item>
  </Form>;
};

const scriptsPage = withRouter(ScriptsPage);

export { scriptsPage as ScriptsPage };
