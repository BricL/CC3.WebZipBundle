import { _decorator, Component, error, find, Input, input, instantiate, KeyCode, Node, Prefab, resources } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('main')
export class main extends Component {
    start() {
        input.on(Input.EventType.KEY_DOWN, (event) => {
            if (event.keyCode === KeyCode.KEY_A) {
                const prefab = resources.load<Prefab>('Sprite', (err, prefab) => {
                    if (err) {
                        error(err);
                        return;
                    }

                    const node = instantiate(prefab);
                    node.parent = find('Canvas');
                });
            }
        });
    }

    update(deltaTime: number) {
        
    }
}


