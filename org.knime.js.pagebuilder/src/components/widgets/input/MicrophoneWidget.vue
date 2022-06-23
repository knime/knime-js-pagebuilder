<script>
import Label from 'webapps-common/ui/components/forms/Label';
import Button from 'webapps-common/ui/components/Button';
import ToggleSwitch from 'webapps-common/ui/components/forms/ToggleSwitch';
import ErrorMessage from '@/components/widgets/baseElements/text/ErrorMessage';
import Recorder from './recorder.js';

const DATA_TYPE_KEY = 'value';
const CHUNK_LENGTH = 5000; // 5s

export default {
    components: {
        Label,
        Button,
        ToggleSwitch,
        ErrorMessage
    },
    props: {
        nodeConfig: {
            required: true,
            type: Object,
            validator(obj) {
                return obj.nodeInfo;
            }
        },
        nodeId: {
            required: true,
            type: String,
            validator(nodeId) {
                return nodeId !== '';
            }
        },
        isValid: {
            default: true,
            type: Boolean
        },
        valuePair: {
            default: () => ({
                [DATA_TYPE_KEY]: ''
            }),
            type: Object
        },
        errorMessage: {
            type: String,
            default: null
        }
    },
    data() {
        return {
            capturingTimeout: null,
            isRecording: false,
            isRecordingAvailable: false
        };
    },
    computed: {
        viewRep() {
            return this.nodeConfig.viewRepresentation;
        },
        label() {
            return this.viewRep.label;
        },
        value() {
            return this.valuePair[DATA_TYPE_KEY];
        }
    },
    beforeDestroy() {
        this.stopContinuousCapturing();
    },
    methods: {
        async onStartRecording() {
            try {
                this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                this.audioContext = new AudioContext();
                let input = this.audioContext.createMediaStreamSource(this.stream);

                this.recorder = new Recorder(input, { numChannels: 1 });
                this.recorder.record();
                this.isRecording = true;
            } catch (e) {
                this.isRecording = false;
                consola.error(`Couldn't access microphone`);
            }
        },
        onStopRecording() {
            this.isRecording = false;
            this.isRecordingAvailable = true;

            this.recorder.stop();
            this.stream.getAudioTracks()[0].stop();

            this.getWAV();
        },
        onPlayRecording() {
            this.recorder.getBuffer((buffers) => {
                const newSource = this.audioContext.createBufferSource();
                const newBuffer = this.audioContext.createBuffer(2, buffers[0].length, this.audioContext.sampleRate);
                newBuffer.getChannelData(0).set(buffers[0]);
                newBuffer.getChannelData(1).set(buffers[0]);
                newSource.buffer = newBuffer;

                newSource.connect(this.audioContext.destination);
                newSource.start(0);
            });
        },
        startContinuousCapturing() {
            consola.log('start continuous capturing');
            this.onStartRecording();
            this.capturingTimeout = setTimeout(() => {
                this.onStopRecording();

                if (this.capturingTimeout !== null) {
                    this.startContinuousCapturing();
                }
            }, CHUNK_LENGTH);
        },
        stopContinuousCapturing() {
            this.onStopRecording();
            clearTimeout(this.capturingTimeout);
            this.capturingTimeout = null;
        },
        getWAV() {
            this.recorder.exportWAV(async (blob) => {
                let base64 = await this.blobToBase64(blob);
                base64 = base64.replace('data:audio/wav;base64,', '');
                this.onChange(base64);
            });
        },
        blobToBase64(blob) {
            return new Promise((resolve, _) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        },
        onChange(value) {
            const changeEventObj = {
                nodeId: this.nodeId,
                type: DATA_TYPE_KEY,
                value
            };
            this.$emit('updateWidget', changeEventObj);
        },
        onContinouslyRecordInput(enable) {
            if (enable) {
                this.startContinuousCapturing();
            } else {
                this.stopContinuousCapturing();
            }
        },
        validate() {
            return { isValid: true, errorMessage: null };
        }
    }
};
</script>

<template>
  <Label
    :text="label"
  >
   
    <Button
      v-show="!isRecording"
      primary
      @click="onStartRecording"
    >Start audio recording</Button>
    &nbsp;
    <Button
      v-show="isRecording"
      primary
      @click="onStopRecording"
    >Stop audio recording</Button>
    <Button
      with-border
      :disabled="!isRecordingAvailable"
      @click="onPlayRecording"
    >Play recording</Button>
    <br>
    <ToggleSwitch
      @input="onContinouslyRecordInput"
    >continously record</ToggleSwitch>

    
    <ErrorMessage :error="errorMessage" />
  </Label>
</template>

<style scoped>
</style>
