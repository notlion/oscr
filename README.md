## oscr
A Read Eval Print loop for Open Sound Control messages

### Installation
```
$ npm install -g oscr
```

### Usage
Specify outgoing host and port.

```
$ oscr -h localhost -p 7777
```
Specify an incoming port to log OSC messages.

```
$ oscr -h localhost -p 7777 -i 8000
```
Then enter some OSC messages.

```
> /hello iii 1 2 3  # <path> <type-tag> <args>
```

### Tricks
You can include any valid javascript expression, as long as there are no spaces ;)

```
> ['','foo','moo'].join('/') Array(4).join('f') 3-1 1+1 1*3
{ path: '/foo/moo',
  typetag: 'fff',
  params: [ '1', '2', '3' ] }
```
Not that you would want to do this, though...
