import * as React from 'react';
import * as ProfilesProps from './container';
import './profiles.less';
import { IonContent } from '@ionic/react';

export default class Profiles extends React.Component<ProfilesProps.IProps, ProfilesProps.IState> {
    constructor(props: ProfilesProps.IProps) {
        super(props);
    }

    render() {
        return <IonContent>
            Profiles
        </IonContent>
        /*<Form className="settings-content-container-presets" onSubmit={this.saveSettings}>
            <div className='settings-content-container-presets-datarow'>
                <div className='settings-content-container-presets-datarow-spacer' />
                <div className='settings-content-container-presets-datarow-content'>
                    {this.props.presets.map((preset, index) => {
                        return (
                            <FormItem
                                key={`preset_${index}`}
                                label={`Preset #${index+1}`}
                                validateStatus={this.state.presets[index] ? this.state.presets[index].validationStatus : 'success'}
                                help={this.state.presets[index] ? this.state.presets[index].errorMsg : ''}
                            >
                                <InputNumber
                                    min={MIN_PRESET}
                                    max={MAX_PRESET}
                                    defaultValue={preset}
                                    // tslint:disable-next-line:jsx-no-lambda
                                    onChange={(value) => this.handlePresetChange(index, value as string|number)}
                                />
                            </FormItem>
                        );
                    })}
                </div>
                <div className='settings-content-container-presets-datarow-spacer' />
            </div>
            <div className='settings-content-container-presets-datarow'>
                <div className='settings-content-container-presets-datarow-content'>
                    <FormItem
                        key={`autoShutoff`}
                        label={`Auto Shutoff (in Minutes)`}
                        validateStatus={this.state.autoShutoff >= 0 ? 'success' : 'error'}
                        help={this.state.autoShutoff >= 0 ? '' : 'Auto Shutoff Value must be >= 0.'}
                    >
                        <InputNumber
                            min={0}
                            max={1440}
                            defaultValue={this.props.autoShutoff}
                            // tslint:disable-next-line:jsx-no-lambda
                            onChange={(value) => this.handleAutoShutoffChange(value as string|number)}
                        />
                    </FormItem>
                </div>
                <div className='settings-content-container-presets-datarow-spacer' />
            </div>
            <FormItem className="settings-content-container-presets-buttonrow">
                <Button
                    htmlType="submit"
                    disabled={!this.isValid()}
                >
                    Save
                </Button>
            </FormItem>
        </Form>;*/
    }
}